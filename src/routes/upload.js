import express from 'express'
const router = express.Router()
// Multer
import multer from 'multer'
import * as path from 'path'
// Collection
import { connectToDatabase } from '../utils/mongodb.js'
const nomeCollection = 'uploads'
const { db, ObjectId } = await connectToDatabase()

//Configurações do Multer (Pasta padrão e como será gravado o nome do arquivo)
const multerStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./public");
    },
    filename: (req, file, callback) => {
        const ext = path.parse(file.originalname).ext 
        //Adicionando a data atual em segundos no nome do arquivo
        callback(null, `uploads/dogWalker-${path.parse(file.originalname).name}-${Date.now()}${ext}`);
    },
})


// Efetuando filtros dos tipos de arquivo
const multerFilter = (req, file, callback) => {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return callback(new Error('⚠️Apenas imagens são aceitas!'))
    }
    else {
        callback(null, true)
    }
}

//Calling the "multer" Function
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

/********************************************
* Processo de upload de uma imagem
* POST /
*********************************************/
const uploadSingleImage = upload.single('Livro')

router.post('/', function (req, res) {

    uploadSingleImage(req, res, async function (err) {
        if (err) { //ocorreu algum erro?
            return res.status(400).json({
                status: false,
                message: `⚠️Não foi possível efetuar o upload: ${err}`,
            })
        }
        const file = req.file
        const dadosLivro = {
            status: true,
            filename: file.filename,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            fieldname: file.fieldname
        }
        //Salvando os dados do upload no MongoDB
        await db.collection(nomeCollection)
        .insertOne(dadosLivro)
        .then(result => res.status(200).send(dadosLivro)) 
        .catch(err => res.status(400).json(err))
    })
})

export default router


