"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    search(searchableFields) {
        var _a;
        const searchTerm = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map((field) => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })),
            });
        }
        return this;
    }
    filter() {
        const queryObj = Object.assign({}, this.query); // copy
        // Filtering
        const excludeFields = [
            'searchTerm',
            'sort',
            'limit',
            'page',
            'fields',
            'priceRange',
        ];
        excludeFields.forEach((el) => delete queryObj[el]);
        if (queryObj.category === '') {
            delete queryObj.category;
        }
        if (this.query.priceRange) {
            const [minPrice, maxPrice] = this.query.priceRange;
            queryObj.price = { $gte: minPrice, $lte: maxPrice };
        }
        this.modelQuery = this.modelQuery.find(queryObj);
        return this;
    }
    sort() {
        const sortParam = this.query.sort;
        let sortCriteria = {};
        if (sortParam) {
            if (sortParam === 'priceAsc') {
                sortCriteria = { price: 1 };
            }
            else if (sortParam === 'priceDesc') {
                sortCriteria = { price: -1 };
            }
        }
        else {
            sortCriteria = { price: -1 };
        }
        this.modelQuery = this.modelQuery.sort(sortCriteria);
        return this;
    }
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    fields() {
        var _a, _b;
        const selectFields = ((_b = (_a = this.query.fields) === null || _a === void 0 ? void 0 : _a.split(',')) === null || _b === void 0 ? void 0 : _b.join(' ')) || '-__v';
        this.modelQuery = this.modelQuery.select(selectFields);
        return this;
    }
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalQueries = this.modelQuery.getFilter();
            const total = yield this.modelQuery.model.countDocuments(totalQueries);
            const page = Number(this.query.page) || 1;
            const limit = Number(this.query.limit) || 10;
            const totalPage = Math.ceil(total / limit);
            return {
                page,
                limit,
                total,
                totalPage,
            };
        });
    }
}
exports.default = QueryBuilder;
