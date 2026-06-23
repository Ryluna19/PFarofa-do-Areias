INSERT INTO
    admins (full_name, email, password_hash)
VALUES
    (
        'Administrador',
        '[admin@farofadoareias.local](mailto:admin@farofadoareias.local)',
        crypt ('admin12345', gen_salt ('bf'))
    ) ON CONFLICT (email) DO NOTHING;

INSERT INTO
    products (
        name,
        category,
        description,
        price,
        emoji,
        has_customization,
        active,
        display_order
    )
VALUES
    (
        'Farofa de Bacon com Ovo',
        'Farofas',
        'Farofa crocante de mandioca com bacon artesanal e ovos mexidos',
        24.90,
        '🥓',
        TRUE,
        TRUE,
        1
    ),
    (
        'Farofa de Calabresa',
        'Farofas',
        'Farofa de mandioca torrada com calabresa defumada e cebolinha',
        22.90,
        '🥩',
        TRUE,
        TRUE,
        2
    ),
    (
        'Farofa Vegana',
        'Farofas',
        'Farofa integral com legumes grelhados, tomate seco e azeitonas',
        21.90,
        '🥬',
        TRUE,
        TRUE,
        3
    ),
    (
        'Vinagrete Caseiro',
        'Acompanhamentos',
        'Vinagrete fresquinho com tomate, cebola, pimentão e cheiro-verde',
        8.90,
        '🍅',
        FALSE,
        TRUE,
        4
    ),
    (
        'Farofa Extra Simples',
        'Acompanhamentos',
        'Porção extra de farofa de mandioca torrada pura',
        6.90,
        '🍚',
        FALSE,
        TRUE,
        5
    ),
    (
        'Suco Natural de Frutas',
        'Bebidas',
        'Suco natural da fruta: laranja, limão, maracujá ou acerola',
        9.90,
        '🧃',
        FALSE,
        TRUE,
        6
    ),
    (
        'Refrigerante Lata',
        'Bebidas',
        'Coca-Cola, Guaraná Antarctica ou Sprite',
        6.00,
        '🥤',
        FALSE,
        TRUE,
        7
    ) ON CONFLICT (name) DO NOTHING;