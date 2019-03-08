# SQL requests telegram bot

> SQL requests telegram bot

Бот создан с использованием Node.js и PostgreSQL 

## Для запуска проекта необходимо:

- Выполнить команду
  ### `node index`

- Создать две обязательные таблицы в базе данных
  - #### `CREATE TABLE public.auth_users
          (
              id integer NOT NULL DEFAULT nextval('auth_users_id_seq'::regclass),
              user_id integer NOT NULL DEFAULT nextval('auth_users_user_id_seq'::regclass),
              lifetime bigint NOT NULL,
              CONSTRAINT auth_users_pkey PRIMARY KEY (id)
          )`
  - #### `CREATE TABLE public.users
          (
              id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
              name character varying(60) COLLATE pg_catalog."default" NOT NULL,
              hash_password character varying(255) COLLATE pg_catalog."default" NOT NULL,
              CONSTRAINT users_pkey PRIMARY KEY (id)
          )`

