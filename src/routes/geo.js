import express from 'express'
import fetch from 'node-fetch'

import { config } from 'dotenv'
config() // carrega as variáveis definidas no .env
const { MAP_QUEST_API_KEY } = process.env


const router = express.Router()

/*****************************************************************************
 * GET /api/geo/geo-latlng?lat=-23.26428&lng=-47.29804
  ****************************************************************************/
router.get('/geo-latlng', async (req, res) => {
  /* #swagger.tags = ['MapQuest']
 #swagger.description = 'Endpoint que retorna o endereço/localização a partir da latitude e longitude informados' 
 */
  const { lat, lng } = req.query
  try {
    let url = `http://www.mapquestapi.com/geocoding/v1/reverse?key=${MAP_QUEST_API_KEY}&location=${lat},${lng}`

    const endereco = await fetch(url)
    const dadosEndereco = await endereco.json()
    res.status(200).json(dadosEndereco.results[0])
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter o endereço na API MapQuest',
          param: '/'
        }
      ]
    })
  }
})

/*****************************************************************************
 * GET /api/geo/geo-endereco?localizacao=Rua Floriano Peixoto, 1040, Itu
  ****************************************************************************/
router.get('/geo-endereco', async (req, res) => {
  /* #swagger.tags = ['MapQuest']
#swagger.description = 'Endpoint que retorna a latitude e longitude a partir de um endereço/localização informado' 
*/
  const { localizacao } = req.query
  try {
    let url = `http://www.mapquestapi.com/geocoding/v1/address?key=${MAP_QUEST_API_KEY}&location=${localizacao},BR`

    const endereco = await fetch(url)
    const dadosEndereco = await endereco.json()
    res.status(200).json(dadosEndereco.results[0])
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter a latitude e longitude na API MapQuest',
          param: '/'
        }
      ]
    })
  }
})


/*****************************************************************************
 * GET /api/geo/empresa?cnpj=30585126000136
  ****************************************************************************/
router.get('/empresa', async (req, res) => {
  // #swagger.tags = ['BrasilAPI']
  // #swagger.description = 'Endpoint que retorna os dados de uma empresa a partir do seu CNPJ'
  /* #swagger.parameters['cnpj'] = {
         in: 'query',
         description: 'CNPJ da empresa. (sem pontos ou traços)',
         type: 'string'
  } */
  const { cnpj } = req.query
  try {
    let url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`

    const empresa = await fetch(url)
    const dadosEmpresa = await empresa.json()
    res.status(200).json(dadosEmpresa)
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter os dados da empresa na API BrasilAPI',
          param: '/'
        }
      ]
    })
  }
})
export default router