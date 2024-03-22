import multer from 'multer';
import { extname } from 'path';

export default function getMulter(folder: 'event' | 'organizer' | 'user'): multer.Multer {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `uploads/${folder}/`)
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + extname(file.originalname))
        }
    });

    const upload = multer({ storage: storage });
    return upload;
}