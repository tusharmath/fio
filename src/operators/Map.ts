import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {SafeResolve} from '../internals/SafeResolve'

/**
 * @ignore
 */
export class Map<A, B> implements FIO<B> {
  public constructor(
    private readonly src: FIO<A>,
    private readonly ab: (a: A) => B
  ) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<B>): Cancel {
    return this.src.fork(sh, rej, a => SafeResolve(this.ab(a), rej, res))
  }
}
