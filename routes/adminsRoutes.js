import express from 'express';
import { loginAdmin, registerAdmin } from '../controllers/adminsController.js';

const adminsRouter = express.Router();

adminsRouter.route('/login').post(loginAdmin);
adminsRouter.route('/register').post(registerAdmin);
// adminsRouter
//   .route('/user/:id')
//   .get(getAdmin)
//   .patch(updateAdmin)
//   .delete(deleteAdmin);

export default adminsRouter;