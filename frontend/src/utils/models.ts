export interface ListResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

interface Id {
    readonly id: string;
}

interface Timestampable {
    readonly created_at: string;
    readonly deleted_at: string | null;
    readonly updated_at: string;
}

export interface Category extends Id, Timestampable {
    name: string;
    description: string;
    is_active: boolean;
}

export interface CastMember extends Id, Timestampable {
    name: string;
    type: number;
}

export interface Genre extends Id, Timestampable {
    name: string;
    is_active: boolean;
    categories: Category[];
}
