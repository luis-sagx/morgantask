import type { Request, Response } from 'express'

import { analyticsUseCases } from '../../infrastructure/container'
import { getErrorMessage } from '../utils/error'

export class AnalyticsController {
    static readonly getReport = async (req: Request, res: Response) => {
        try {
            const report = await analyticsUseCases.generateProjectReport(req.params.projectId)
            res.json(report)
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getCompletion = async (req: Request, res: Response) => {
        try {
            const rate = await analyticsUseCases.getCompletionRate(req.params.projectId)
            res.json({ completionRate: rate })
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }

    static readonly getCustomMetric = async (req: Request, res: Response) => {
        try {
            const value = await analyticsUseCases.evaluateCustomMetric(req.params.projectId, req.query.formula as string)
            res.json({ value })
        } catch (error) {
            res.status(500).json({ error: getErrorMessage(error) })
        }
    }
}
