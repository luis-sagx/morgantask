import { Router } from 'express'
import { body } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { authenticate } from '../middleware/auth'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/login',
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio'),
    handleInputErrors,
    AuthController.login
)

router.get('/user',
    authenticate,
    AuthController.user
)

/** Profile */
router.put('/profile',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.updateProfile
)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('El password actual no puede ir vacio'),
    body('password')
        .isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router