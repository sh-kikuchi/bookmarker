-- Table: public.categories

-- DROP TABLE IF EXISTS public.categories;

CREATE TABLE IF NOT EXISTS public.categories
(
    id bigserial NOT NULL,
    user_id bigint,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
)

--INSERT INTO categories(user_id,name) VALUES(1,'ポートフォリオ');
