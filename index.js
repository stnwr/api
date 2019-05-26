import path from 'path'
import { createResourceRouteOptions, generateUISchema } from './apiutils'

export default {
  plugin: {
    name: 'stoneware-api',
    register (server, options) {
      const { app, models, relativeTo } = options

      app.tables.forEach(table => {
        const Model = models[table.modelName]

        // Resource routes
        const routes = createResourceRouteOptions({ table, Model })

        // Schema route
        routes.push({
          method: 'get',
          path: `/table/${table.name}/schema`,
          handler () {
            return Model.jsonSchema
          }
        })

//         import parser from 'json-schema-ref-parser'
// const opts = { dereference: { circular: 'ignore' } }

// parser.dereference('/Users/dstone/Documents/dev/stoneware/project/schema/ui/simple.json', opts)
//   .then(res => {
//     console.log(res)
//   })
        // Schema route
        routes.push({
          method: 'get',
          path: `/table/${table.name}/ui/schema`,
          handler (request, h) {
            const filepath = path.join(relativeTo, 'schema/ui', `${table.name}.json`)

            return h.file(filepath, {
              confine: false
            })
          },
          options: {
            ext: {
              onPreResponse: {
                method: (request, h) => {
                  const response = request.response
                  if (response.isBoom &&
                      response.output.statusCode === 404) {
                    return generateUISchema(Model.jsonSchema)
                  }

                  return h.continue
                }
              }
            }
          }
        })

        // Register routes
        server.route(routes)
      })

      // const routes = createResourceRouteOptions(app)

      // server.route(routes)
    }
  }
}
