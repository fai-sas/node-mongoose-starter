import { FilterQuery, Query } from 'mongoose'

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>
  public query: Record<string, unknown>

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery
    this.query = query
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            } as FilterQuery<T>)
        ),
      })
    }

    return this
  }

  filter() {
    const queryObj = { ...this.query } // copy

    // Filtering
    const excludeFields = [
      'searchTerm',
      'sort',
      'limit',
      'page',
      'fields',
      'priceRange',
    ]

    excludeFields.forEach((el) => delete queryObj[el])

    if (queryObj.category === '') {
      delete queryObj.category
    }

    if (this.query.priceRange) {
      const [minPrice, maxPrice] = this.query.priceRange as number[]
      queryObj.price = { $gte: minPrice, $lte: maxPrice }
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>)

    return this
  }

  sort() {
    const sortParam = this.query.sort as string
    let sortCriteria = {}

    if (sortParam) {
      if (sortParam === 'priceAsc') {
        sortCriteria = { price: 1 }
      } else if (sortParam === 'priceDesc') {
        sortCriteria = { price: -1 }
      }
    } else {
      sortCriteria = { price: -1 }
    }

    this.modelQuery = this.modelQuery.sort(sortCriteria)

    return this
  }

  paginate() {
    const page = Number(this.query.page) || 1
    const limit = Number(this.query.limit) || 10
    const skip = (page - 1) * limit

    this.modelQuery = this.modelQuery.skip(skip).limit(limit)

    return this
  }

  fields() {
    const selectFields =
      (this.query.fields as string)?.split(',')?.join(' ') || '-__v'

    this.modelQuery = this.modelQuery.select(selectFields)
    return this
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter()
    const total = await this.modelQuery.model.countDocuments(totalQueries)
    const page = Number(this.query.page) || 1
    const limit = Number(this.query.limit) || 10
    const totalPage = Math.ceil(total / limit)

    return {
      page,
      limit,
      total,
      totalPage,
    }
  }
}

export default QueryBuilder
