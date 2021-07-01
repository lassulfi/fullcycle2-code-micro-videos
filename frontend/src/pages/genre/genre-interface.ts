import Category from "../category/category-interface";

export default interface Genre {
    id: string,
    name: string,
    is_active: boolean
    categories: Category[]
}