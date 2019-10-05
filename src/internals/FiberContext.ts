/**
 * Created by tushar on 2019-05-24
 */

/* tslint:disable: no-unbound-method */

import {check} from 'checked-exceptions'
import {Either} from 'standard-data-structures'
import {ICancellable, IScheduler} from 'ts-scheduler'

import {Await} from '../main/Await'
import {Fiber} from '../main/Fiber'
import {FIO, IO, UIO} from '../main/FIO'
import {Instruction, Tag} from '../main/Instructions'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {Exit} from './Exit'

const InvalidInstruction = check(
  'InvalidInstruction',
  (ins: Instruction) => `${Tag[ins.tag]}`
)

/**
 * An actual implementation of [[Fiber]] type.
 * FiberContext evaluates a FIO expression tree in a stack safe manner.
 * It internally uses a job scheduler to maintain a queue of all the tasks that need to be performed.
 * The job queue is represented by [[IScheduler]] and can be shared across multiple instances of [[FiberContext]].
 */
export class FiberContext<E = never, A = never> extends Fiber<E, A>
  implements ICancellable {
  /**
   * Pure implementation of cancel()
   */
  public get abort(): UIO<void> {
    return UIO(() => this.cancel())
  }

  private get execute(): FIO<E, A> {
    return FIO.asyncIO<E, A>((rej, res) => this.unsafeExecute(rej, res))
  }

  /**
   * Runs the fiber context once and caches the result.
   */
  public get join(): FIO<E, A> {
    return this.await.set(this.execute).and(this.await.get)
  }

  public static of<E, A>(sh: IScheduler, io: IO<E, A>): FiberContext<E, A> {
    return new FiberContext(sh, io.asInstruction)
  }
  private readonly await = new Await<E, A>()
  private readonly cancellationList = new CancellationList()
  private readonly stackA: Instruction[] = []
  private readonly stackEnv: unknown[] = []

  private constructor(
    public readonly sh: IScheduler,
    instruction: Instruction
  ) {
    super()
    this.stackA.push(instruction)
  }

  public cancel(): void {
    this.stackA.splice(0, this.stackA.length)
    this.cancellationList.cancel()
  }

  public exit(fio: UIO<void>): UIO<void> {
    return UIO(() => {
      this.cancellationList.push(new Exit(FiberContext.of(this.sh, fio)))
    })
  }

  public resumeAsync(cb: (exit: Either<E, A>) => UIO<void>): UIO<void> {
    const collect = <X>(con: (x: X) => Either<E, A>) => (data: X) => {
      const cancel = () => this.cancellationList.remove(id)
      const id = this.cancellationList.push(
        FiberContext.of(this.sh, cb(con(data))).unsafeExecute(cancel, cancel)
      )
    }

    return UIO(
      () => void this.unsafeExecute(collect(Either.left), collect(Either.right))
    )
  }

  /**
   * Continues to evaluate the current stack.
   * Used after the fiber yielded.
   */
  public unsafeExecute(rej: CB<E>, res: CB<A>): FiberContext<E, A> {
    const id = this.cancellationList.push(
      this.sh.asap(
        this.evaluate.bind(this),
        (cause: E) => {
          this.cancellationList.remove(id)
          rej(cause)
        },
        (value: A) => {
          this.cancellationList.remove(id)
          res(value)
        }
      )
    )

    return this
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private evaluate(rej: CB<E>, res: CB<A>): void {
    let data: unknown

    while (true) {
      try {
        const j = this.stackA.pop()

        if (j === undefined) {
          return res(data as A)
        }

        switch (j.tag) {
          case Tag.Constant:
            data = j.i0
            break

          case Tag.Call:
            this.stackA.push(j.i0(...j.i1))
            break

          case Tag.Reject:
            while (
              this.stackA.length > 0 &&
              this.stackA[this.stackA.length - 1].tag !== Tag.Capture
            ) {
              this.stackA.pop()
            }
            const cause = j.i0 as E
            const handler = this.stackA.pop()
            if (handler !== undefined && handler.tag === Tag.Capture) {
              this.stackA.push(handler.i0(cause))
            } else {
              return rej(cause)
            }
            break

          case Tag.Try:
            data = j.i0(data)
            break

          case Tag.TryM:
            this.stackA.push(j.i0(data))
            break

          case Tag.Map:
            this.stackA.push(FIO.resume(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break

          case Tag.Capture:
            break

          case Tag.Chain:
            this.stackA.push(FIO.resumeM(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break

          case Tag.Catch:
            this.stackA.push(FIO.capture(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break

          case Tag.Never:
            return

          case Tag.Fork:
            // Using the `new` operator because FiberContext.of() needs an IO.
            // Computation should continue in the background.
            // A new context is created so that computation from that instruction can happen separately.
            // and then join back into the current context.
            // Using the same stack will corrupt it completely.
            const nContext = new FiberContext(this.sh, j.i0)
            this.cancellationList.push(nContext)
            data = nContext
            break

          case Tag.Provide:
            this.stackA.push(
              FIO.resume(i => {
                this.stackEnv.pop()

                return i
              }).asInstruction
            )
            this.stackA.push(j.i0)
            this.stackEnv.push(j.i1)
            break

          case Tag.Access:
            const env = this.stackEnv[this.stackEnv.length - 1]
            data = j.i0(env)
            break

          case Tag.Async:
            const id = this.cancellationList.push(
              j.i0(
                err => {
                  this.cancellationList.remove(id)
                  this.stackA.push(FIO.reject(err).asInstruction)
                  this.unsafeExecute(rej, res)
                },
                val => {
                  this.cancellationList.remove(id)
                  this.stackA.push(FIO.of(val).asInstruction)
                  this.unsafeExecute(rej, res)
                }
              )
            )

            return

          default:
            this.stackA.push(
              FIO.reject(new InvalidInstruction(j)).asInstruction
            )
        }
      } catch (e) {
        this.stackA.push(FIO.reject(e).asInstruction)
      }
    }
  }
}
