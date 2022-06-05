// API REST do livro
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'livros'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaLivro= [
    check('nome', 'Nome do livro é obrigatório').not().isEmpty(),
    check('autor(a)', 'Nome do(a) autor(a)é obrigatório').not().isEmpty(),
    check('ano de lançamento', 'A data de lançamento tem que ser em números').isNumeric()
]



/**********************************************
 * GET /livros/:id
 **********************************************/
router.get("/:id", async (req, res) => {
      /* #swagger.tags = ['Livros']
      #swagger.description = 'Endpoint que retorna os dados do livro filtrando pelo id' 
      */
    try {
        db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err) //bad request
            } else {
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * GET /livros/nome/:nome
 **********************************************/
router.get("/nome/:nome", async (req, res) => {
    /* #swagger.tags = ['Livros']
      #swagger.description = 'retorna os livros filtrados pelo nome'
      */
    try {
        db.collection(nomeCollection).find({ nome: { $regex: req.params.nome, $options: "i" } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err) //bad request
            } else {
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * POST /Livros/
 **********************************************/
router.post('/', validaLivro, async (req, res) => {
    /* #swagger.tags = ['Livros']
      #swagger.description = 'Endpoint que inclui um novo Livro' 
      */
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
            .insertOne(req.body)
            .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * PUT /livroa
 * Alterar um livro pelo ID
 **********************************************/
router.put('/', validaLivro, async (req, res) => {
    /* #swagger.tags = ['Livros']
      #swagger.description = 'Endpoint que permite alterar os dados do livro pelo id' 
      */
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json(({
            errors: schemaErrors.array() //retorna um Forbidden
        }))
    } else {
        await db.collection(nomeCollection)
            .updateOne({ '_id': { $eq: ObjectId(req.body._id) } },
                { $set: req.body }
            )
            .then(result => res.status(202).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * DELETE /livros/
 **********************************************/
router.delete('/:id', async (req, res) => {
    /* #swagger.tags = ['Livros']
      #swagger.description = 'Endpoint que permite excluir um livro filtrando pelo id' 
      */
    await db.collection(nomeCollection)
        .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
})

export default router

