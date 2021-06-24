import { RouteProps } from "react-router-dom";
import CategoryList from "../pages/category/PageList";
import CastMemberList from '../pages/cast-member/PageList';
import GenreList from '../pages/genres/PageList';
import Dashboard from "../pages/Dashboard";

export interface MyRouteProps extends RouteProps {
    name: string;
    label: string;
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    }, {
        name: 'categories.list',
        label: 'Listar categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    }, {
        name: 'categories.create',
        label: 'Criar categorias',
        path: '/categories/create',
        component: CategoryList,
        exact: true
    }, {
        name: 'cast_members.list',
        label: 'Listar Membros do Elenco',
        path: '/cast_members',
        component: CastMemberList,
        exact: true
    }, {
        name: 'cast_members.create',
        label: 'Criar Membro do Elenco',
        path: '/cast_members/create',
        component: CastMemberList,
        exact: true
    }, {
        name: 'genres.list',
        label: 'Listar Gêneros',
        path: '/genres',
        component: GenreList,
        exact: true
    }, {
        name: 'genres.create',
        label: 'Criar Gênero',
        path: '/genres/create',
        component: GenreList,
        exact: true
    }
];

export default routes;