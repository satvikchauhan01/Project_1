import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.js';

const router= Router();

router.route("/register").post(
    upload.fields([           //used to handle files(here images for avatar and cover images)
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)
export default router;