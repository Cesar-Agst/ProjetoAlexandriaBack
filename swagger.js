// Dica. Utilize o editor disponível em: https://editor.swagger.io/
import swaggerAutogen from 'swagger-autogen'

const doc = {
    swagger: "2.0",
    info: {
        version: "1.0.0",
        title: "📚 Projeto Alexandriar",
        description: "➡️Documentação gerada automaticamente pelo módulo <a href='https://github.com/davibaltar/swagger-autogen' target='_blank'>swagger-autogen</a>."
    },
    host: 'localgost:4000',
    basePath: "/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        apiKeyAuth:{
            type: "apiKey",
            in: "header",       // can be "header", "query" or "cookie"
            name: "access-token",  // name of the header, query parameter or cookie
            description: "Token de Acesso gerado após o login"
        }
    },
    definitions: {
        Erro: {
            value: "Erro gerado pela aplicação",
            msg: "Mensagem detalhando o erro",
            param: "URL que gerou o erro"
        },
        Usuário: {
            nome: "Josefina Gusmão",
            email: "josefina@uol.com.br",
            ativo: true,
            tipo: "Cliente",
            avatar: "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Josefina+Gusmão"
        },
        Prestadores:{
            cnpj: "33719377000156",
            razao_social: "AIMEEVET SERVICOS VETERINARIOS EIRELI",
            nome_fantasia: "",
            ddd_telefone_1: "1176018050",
            ddd_telefone_2: "",
            cep: "04776150",
            logradouro: "MARIO DE OLIVEIRA",
            numero: "421",
            municipio: "ITU",
            bairro: "JARDIM PAULISTA II",
            uf: "SP",
            porte: "MICRO EMPRESA",
            natureza_juridica: "Empresa Individual de Responsabilidade Limitada (de Natureza Empresária)",
            cnae_fiscal: 7500100,
            cnae_fiscal_descricao: "Atividades veterinárias",
            data_inicio_atividade: "2019-05-24",
            descricao_situacao_cadastral: "ATIVA",
            localizacao:{type:"Point",coordinates:[-23.28861,-47.31145]}
        },
        DadosUsuário: {
            $nome: "Josefina Gusmão",
            $email: "josefina@uol.com.br",
            $senha: "SenhaSecreta",
            tipo: "Cliente",
            ativo: true,
            avatar: "https://ui-avatars.com/api/?background=3700B3&color=FFFFFF&name=Dog+Walker"
        }
    }
}

const outputFile = './src/swagger/swagger_output.json'
const endpointsFiles = ['./src/server.js']
const options = {
    swagger: '2.0',          // By default is null
    language: 'pt-BR',         // By default is 'en-US'
    disableLogs: false,     // By default is false
    disableWarnings: false  // By default is false
}

swaggerAutogen(options)(outputFile, endpointsFiles, doc).then(async () => {
    await import('./src/server.js'); // Your project's root file
  });