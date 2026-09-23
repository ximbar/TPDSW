import { NextFunction, Request, Response } from 'express'
import { RequestContext } from '@mikro-orm/core'
import { orm } from './orm.js'

export const forkEntityManager = (req: Request, res: Response, next: NextFunction) => {
  RequestContext.create(orm.em, next)
}
