
-- Table: public.bookmarks

-- DROP TABLE IF EXISTS public.bookmarks;

CREATE TABLE IF NOT EXISTS public.bookmarks
(
    id bigserial NOT NULL,
    user_id bigint,
    category_id bigint,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    url character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT bookmarks_pkey PRIMARY KEY (id)
);


/*----------------
testData
-----------------*/
-- INSERT INTO bookmarks(user_id,category_id,name,url) VALUES
-- (1,1,'Re:Vue','https://sh-revue.net/'),
-- (1,1,'mysite','http://sh21mysite.com/mysite/main/index.php'),
-- (1,1,'kanban','http://sk-kanban.herokuapp.com/login'),
-- (1,1,'smalltalk','http://toolbox-smalltalk.herokuapp.com/login'),
-- (1,1,'bookstock','http://sk-bookstock.herokuapp.com/login');
