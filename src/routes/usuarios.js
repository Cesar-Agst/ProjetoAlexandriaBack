// API REST dos usuários
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'
import auth from '../middleware/auth.js'
//JWT
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()
const nomeCollection = 'usuarios'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaUsuario = [
  check('nome')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome do usuário')
    .isAlpha('pt-BR', { ignore: ' ' }).withMessage('O nome do usuário deve conter apenas texto')
    .isLength({ max: 100 }).withMessage('O nome do usuário é muito longo. Informe no máximo 100 caracteres'),
  check('email')
    .not().isEmpty().trim().withMessage('É obrigatório informar o email do usuário')
    .isEmail().withMessage('O email do usuário deve ser válido')
    .custom((value, { req }) => {
      return db.collection(nomeCollection).find({ email: { $eq: value } }).toArray()
        .then((email) => {
          if (email.length && !req.params.id) {
            return Promise.reject(`O email ${value} já está informado em outro usuário`)
          }
        })
    }),
  check('senha')
    .not().isEmpty().trim().withMessage('É obrigatório informar a senha do usuário')
    .isLength({ min: 5 }).withMessage('A senha deve conter no mínimo 5 caracteres')
    .isStrongPassword({
      minLength: 5,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    }).withMessage('A senha informada não é segura. Ela deve conter ao menos 1 letra maiúscula e 1 número  '),
  check('ativo')
    .default(true)
    .not().isString().withMessage('O valor informado para o campo ativo não pode ser um texto')
    .not().isInt().withMessage('O valor informado para o campo ativo não pode ser um número')
    .isBoolean().withMessage('O valor informado para o campo ativo deve ser um booleano (True ou False)')
  
]


/**********************************************
 * GET /api/usuarios/
 **********************************************/
router.get('/', async (req, res) => {
  /* 
   #swagger.tags = ['Usuários']
   #swagger.description = 'Endpoint para obter todos os usuários do sistema.' 
   */
  try {
    db.collection(nomeCollection).find({}, {
      projection: { senha: false }
    }).sort({ nome: 1 }).toArray((err, docs) => {
      if (!err) {
        /* 
        #swagger.responses[200] = { 
     schema: { "$ref": "#/definitions/Usuário" },
     description: "Listagem dos usuários obtida com sucesso" } 
     */
        res.status(200).json(docs)
      }
    })
  } catch (err) {
    /* 
       #swagger.responses[500] = { 
    schema: { "$ref": "#/definitions/Erro" },
    description: "Erro ao obter a listagem dos usuários" } 
    */
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter a listagem dos usuários',
          param: '/'
        }
      ]
    })
  }
})

/**********************************************
 * GET /api/usuarios/id/:id
 **********************************************/
router.get('/id/:id', async (req, res) => {
  /* 
  #swagger.tags = ['Usuários']
  #swagger.description = 'Endpoint para obter o usuário através do id.' */
  /*
  #swagger.parameters['id'] = {
          in: 'path',
          description: 'Id do Usuário',
          type: 'string',
          required: true,
          example: '619d068ef455b2ded14c3af4'
    } 
  */
  try {
    db.collection(nomeCollection).find({ '_id': { $eq: ObjectId(req.params.id) } }, {
      projection: { senha: false }
    }).limit(1).toArray((err, docs) => {
      if (!err) {
        /* 
        #swagger.responses[200] = { 
        schema: { "$ref": "#/definitions/Usuário" },
        description: "Listagem do usuário obtido através do id" } 
        */
        res.status(200).json(docs)
      }
    })
  } catch (err) {
    /* 
    #swagger.responses[500] = { 
    schema: { "$ref": "#/definitions/Erro" },
    description: "Erro ao obter a listagem dos usuários filtrando pelo id" } 
    */
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter o usuário pelo id',
          param: '/'
        }
      ]
    })
  }
})

/**********************************************************
 * GET /api/usuarios/nome/:filtro
 **********************************************************/
router.get('/nome/:filtro', async (req, res) => {
    /* 
  #swagger.tags = ['Usuários']
  #swagger.description = 'Endpoint para obter o usuário através parte do seu nome ou e-mail' */
  /*
  #swagger.parameters['filtro'] = {
          in: 'path',
          description: 'Texto a ser filtrado',
          required: true,
          type: 'string',
          example: 'Gomes'
    } 
  */
  try {
    db.collection(nomeCollection).find({
      $or:
        [
          { nome: { $regex: req.params.filtro, $options: 'i' } },
          { email: { $regex: req.params.filtro, $options: 'i' } }
        ]
    }, {
      projection: { senha: false }
    }).limit(10).sort({ nome: 1 }).toArray((err, docs) => {
      if (!err) {
        /* 
        #swagger.responses[200] = { 
        schema: { "$ref": "#/definitions/Usuário" },
        description: "Listagem dos usuários filtrados através do texto" } 
        */
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    /* 
    #swagger.responses[500] = { 
    schema: { "$ref": "#/definitions/Erro" },
    description: "Erro ao obter a listagem dos usuários filtrando pelo nome ou email" } 
    */
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter o usuário pelo nome',
          param: '/'
        }
      ]
    })
  }
})

/**********************************************
 * POST /usuarios/
 **********************************************/
router.post('/', validaUsuario, async (req, res) => {
   /* #swagger.tags = ['Usuários']
      #swagger.description = 'Endpoint para adicionar um novo usuário.' */

   /*   #swagger.parameters['dadosUsuário'] = {
               in: 'body',
               description: 'Informações do usuário.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/DadosUsuário" }
        } 
        */
  //Verificando os erros
  const schemaErrors = validationResult(req)
  if (!schemaErrors.isEmpty()) {
     /* 
    #swagger.responses[403] = { 
    schema: { "$ref": "#/definitions/Erro" },
    description: "Erro ao tentar incluir o novo usuário" } 
    */
    return res.status(403).json(({
      errors: schemaErrors.array() //retorna um Forbidden
    }))
  } else {
    //Iremos definir o avatar a partir da API ui-avatars
    req.body.avatar = `https://ui-avatars.com/api/?background=3700B3&color=FFFFFF&name=${req.body.nome.replace(/ /g, '+')}`
    //Faremos a criptografia da senha
    const salt = await bcrypt.genSalt(10) //impede que uma mesma senha tenha resultados iguais
    req.body.senha = await bcrypt.hash(req.body.senha, salt)
    //Iremos salvar o registro
    await db.collection(nomeCollection)
      .insertOne(req.body)
      // #swagger.responses[201] = { description: 'Usuário registrado com sucesso!' }
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido
      // #swagger.responses[400] = { description: 'Bad Request' }     
      .catch(err => res.status(400).json(err))      //caso dê erro, retornamos o bad request
  }
})

/**********************************************
 * PUT /usuarios/:id
 **********************************************/
router.put('/:id', validaUsuario, async (req, res) => {
     /* #swagger.tags = ['Usuários']
      #swagger.description = 'Endpoint para alterar um usuário.' */

   /*   #swagger.parameters['dadosUsuário'] = {
               in: 'body',
               description: 'Informações do usuário.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/DadosUsuário" }
        } 
        */
  const schemaErrors = validationResult(req)
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json(({
      errors: schemaErrors.array() //retorna um Forbidden
    }))
  } else {
    await db.collection(nomeCollection)
      .updateOne({ '_id': { $eq: ObjectId(req.params.id) } },
        { $set: req.body }
      )
       // #swagger.responses[202] = { description: 'Usuário alterado com sucesso!' }
      .then(result => res.status(202).send(result))
      // #swagger.responses[400] = { description: 'Bad Request' } 
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * DELETE /usuarios/:id
 **********************************************/
router.delete('/:id', async (req, res) => {
     /* #swagger.tags = ['Usuários']
      #swagger.description = 'Endpoint para apagar um usuário pelo id.' */
  await db.collection(nomeCollection)
    .deleteOne({ '_id': { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

/**********************************************
 * POST /usuarios/login
 * Efetua o login do usuário e retorna um token
 **********************************************/

const validaLogin = [
  check('email')
    .not().isEmpty().trim().withMessage('É obrigatório informar o email do usuário para o login')
    .isEmail().withMessage('O email para validar o login deve ser válido'),
  check('senha')
    .not().isEmpty().trim().withMessage('É obrigatório informar a senha do usuário para o login')
    .isLength({ min: 6 }).withMessage('A senha deve conter no mínimo 6 caracteres')
]

router.post('/login', validaLogin,
   /* #swagger.tags = ['Usuários']
      #swagger.description = 'Endpoint para validar o login do usuário e retornar o token JWT.' */
      
  async (req, res) => {
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
      return res.status(403).json(({
        errors: schemaErrors.array() //retorna um Forbidden
      }))
    }

    const { email, senha } = req.body
    try {
      //Iremos localizar o usuário através do e-mal informado
      let usuario = await db.collection(nomeCollection).find({ email }).limit(1).toArray()
      //Se o array estiver vazio, é que o email não está cadastrado
      if (!usuario.length)
        return res.status(404).json({
          errors: [
            {
              value: `${email}`,
              msg: 'Não há nenhum usuário cadastrado com o email informado',
              param: 'email'
            }
          ]
        })
      const isMatch = await bcrypt.compare(senha, usuario[0].senha)
      if (!isMatch)
        return res.status(403).json({
          errors: [
            {
              value: '',
              msg: 'A senha informada está incorreta',
              param: 'senha'
            }
          ]
        })



      jwt.sign(
        { usuario: { id: usuario[0]._id } },
        process.env.SECRET_KEY,
        {
          expiresIn: process.env.EXPIRES_IN
        },
        (err, token) => {
          if (err) throw err
          //setTokenCookie(res, token)
          res.status(200).json({
            access_token: token
          })

        }
      )
    } catch (e) {
      console.error(e)
      res.status(500).json({
        errors: [
          {
            value: `${err.message}`,
            msg: 'Erro ao gerar o token',
            param: 'token'
          }
        ]
      })
    }
  }
)

/**********************************************
 * POST /usuarios/token
 **********************************************/
router.get('/token', auth, async (req, res) => {
     /* #swagger.tags = ['Usuários']
      #swagger.description = 'Endpoint para verificar se o token passado é válido' */
  // O token enviado junto com a requisição será validado através do auth
  try {
    //A partir do usuário recebido no Token, iremos dar um 'Refresh' no Token, gerando-o novamente
    let access_token = jwt.sign(
      { usuario: { id: req.usuario.id } },
      process.env.SECRET_KEY,
      { expiresIn: process.env.EXPIRES_IN })
    res.status(200).json({
      access_token: access_token
    })
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao gerar o token',
          param: 'token'
        }
      ]
    })
  }
})

export default router