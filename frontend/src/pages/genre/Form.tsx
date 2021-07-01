// @flow 
import { Box, Button, ButtonProps, Checkbox, Chip, FormControl, Input, InputLabel, makeStyles, MenuItem, Select, TextField, Theme, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../utils/http/category-http';
import genreHttp from '../../utils/http/genre-http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            maxWidth: 300,
        },
        submit: {
            margin: theme.spacing(1)
        },
        chips: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        chip: {
            margin: 2,
        },
        noLabel: {
            marginTop: theme.spacing(3),
        },
    };
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        },
    },
};

type Category = {
    id: string,
    name: string,
    description: string | null,
    is_active: boolean,
    deleted_at: string | null,
    created_at: string,
    updated_at: string
};


const Form = () => {
    const classes = useStyles();
    const theme = useTheme();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: 'outlined',
    };

    const getStyles = (categoryId: string, categories: Category[], theme: Theme) => {
        return {
            fontWeight:
                categories.some((category) => category.id === categoryId)
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium
        };
    }

    const [categoriesId, setCategoriesId] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        categoryHttp
            .list()
            .then(({data}) => {
                setCategories(data.data)
            }).catch(err => {
                console.error(err);
            });
    }, [categories]);
    
    const {register, watch, getValues, handleSubmit} = useForm({
        defaultValues: {
            is_active: true
        }
    });

    const watchCategoriesId = watch('categoriesId', categoriesId);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setCategoriesId(event.target.value as string[]);
    };

    const onSubmit = (formData) => {
        const data = {...formData};
        data['categories_id'] = watchCategoriesId;
        genreHttp
            .create(data)
            .then((response) => console.log(response.data));
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField 
                name="name"
                label="Nome"
                fullWidth
                variant={'outlined'}
                inputRef={register}
            />
            <FormControl className={classes.formControl}>
                <InputLabel id="categories-label">Categorias</InputLabel>
                {watchCategoriesId && <Select
                    labelId="categories-label"
                    id="categories"
                    multiple
                    value={categoriesId}
                    onChange={handleChange}
                    input={<Input />}
                    renderValue={(selected) => (
                        <div className={classes.chips}>
                            {(selected as string[]).map((value) => {
                                const category = categories.find(category => category.id === value);
                                if (category) {
                                    return <Chip 
                                        key={value} 
                                        label={category.name} 
                                        className={classes.chip}
                                    />
                                }                                
                            })}
                        </div>
                    )}
                    MenuProps={MenuProps}
                >
                    {categories.map((category) => (
                        <MenuItem 
                            key={category.id} 
                            value={category.id}
                            style={getStyles(category.id, categories, theme)}
                        >
                            {category.name}
                        </MenuItem>
                    ))}
                </Select>}
            </FormControl>
            <Box dir={'ltr'}>
                <Checkbox
                    name={'is_active'}
                    inputRef={register}
                    defaultChecked
                />
                Ativo?
            </Box>
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues())}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;