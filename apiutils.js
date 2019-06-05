import boom from 'boom'
import findQuery from 'objection-find'

export function createResourceRouteOptions ({ table, Model }) {
  if (!Model) {
    throw new Error('Expected an ObjectionModel')
  }

  const name = table.name

  return [
    {
      method: 'get',
      path: `/table/${name}`,
      handler: async (request, h) => {
        try {
          const result = await findQuery(Model)
            // .allow(['firstName', 'movies.name', 'children.age', 'parent.lastName'])
            // .allowEager('[children.movies, movies, parent.movies]')
            .build(request.query)
          return result
        } catch (err) {
          return boom.badRequest(err, err.message)
        }
        // const query = Object.assign({ eager: '[enrollments.course]' }, request.query)
        // return Model
        //   .query()
        //   .eager('enrollments')
        //   // .then(function (persons) {
        //   //   res.send(persons)
        //   //   })
        //   // .catch(next)
      }
    },
    {
      method: 'get',
      path: `/table/${name}/{id}`,
      handler: async (request, h) => {
        try {
          const { id } = request.params
          const result = await Model
            .query()
            .findById(id)

          return result || boom.notFound(`${table.title} with id '${id}' was not found`)
        } catch (err) {
          return boom.badRequest(err.message, err)
        }
      }
    },
    {
      method: 'post',
      path: `/table/${name}`,
      handler: async (request, h) => {
        try {
          const result = await Model
            .query()
            .insertAndFetch(request.payload)

          return result
        } catch (err) {
          return boom.badRequest(err, err.message)
        }
      }
    },
    {
      method: 'put',
      path: `/table/${name}/{id}`,
      handler: async (request, h) => {
        try {
          const result = await Model
            .query()
            .updateAndFetchById(request.params.id, request.payload)
          return result
        } catch (err) {
          return boom.badRequest(err, err.message)
        }
      }
    },
    {
      method: 'patch',
      path: `/table/${name}/{id}`,
      handler: async (request, h) => {
        return Model
          .query()
          .patchAndFetchById(request.params.id, request.payload)
      }
    },
    {
      method: 'delete',
      path: `/table/${name}/{id}`,
      handler: async (request, h) => {
        return Model
          .query()
          .delete()
          .where('id', '=', request.params.id)
      }
    }
  ]
}
