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
    check('autor', 'Nome do(a) autor(a)é obrigatório').not().isEmpty(),
    check('lançamento', 'A data de lançamento tem que ser em números').isNumeric()
]

/**********************************************
 * GET /api/livros
 **********************************************/
 router.get('/', async (req, res) => {
  /* 
   #swagger.tags = ['livros']
   #swagger.description = 'Endpoint para obter todos os livros de Serviço do sistema.' 
   */
  try {
    db.collection(nomeCollection).find({}, {
      projection: { senha: false }
    }).sort({ nome: 1 }).toArray((err, docs) => {
      if (!err) {
        /* 
        #swagger.responses[200] = { 
     schema: { "$ref": "#/definitions/livros" },
     description: "Listagem dos livros de serviço obtida com sucesso" } 
     */
        res.status(200).json(docs)
      }
    })
  } catch (err) {
    /* 
       #swagger.responses[500] = { 
    schema: { "$ref": "#/definitions/Erro" },
    description: "Erro ao obter a listagem dos livros" } 
    */
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter a listagem dos livros de serviço',
          param: '/'
        }
      ]
    })
  }
})

/**********************************************
 * GET /livros/id/:id
 **********************************************/
router.get("/id/:id", async (req, res) => {
  /* #swagger.tags = ['livros']
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
 * GET /livros/razao/:razao
 **********************************************/
router.get("/razao/:razao", async (req, res) => {
  /* #swagger.tags = ['livros']
    #swagger.description = 'Endpoint que retorna os dados do livro filtrando por parte da Razão Social' 
    */
  try {
    db.collection(nomeCollection).find({ razao_social: { $regex: req.params.razao, $options: "i" } }).toArray((err, docs) => {
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
 * POST /livros/
 **********************************************/
router.post('/', validaCarona, async (req, res) => {
  /* #swagger.tags = ['livros']
    #swagger.description = 'Endpoint que inclui um novo livro' 
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
 * PUT /livros
 * Alterar um livro pelo ID
 **********************************************/
router.put('/', validaCarona, async (req, res) => {
  let idDocumento = req.body._id
  delete req.body._id //removendo o ID do body para o update não apresentar o erro 66
  /* #swagger.tags = ['livros']
    #swagger.description = 'Endpoint que permite alterar os dados do livro pelo id' 
    */
  const schemaErrors = validationResult(req)
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json(({
      errors: schemaErrors.array() //retorna um Forbidden
    }))
  } else {
    await db.collection(nomeCollection)
      .updateOne({ '_id': { $eq: ObjectId(idDocumento) } },
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
  /* #swagger.tags = ['livros']
    #swagger.description = 'Endpoint que permite excluir um livro filtrando pelo id' 
    */
  await db.collection(nomeCollection)
    .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router 