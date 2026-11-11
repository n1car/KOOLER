--
-- PostgreSQL database dump
--

\restrict sp2hYid81Q1AWQ7BPLaQq1yy4KdAN15hFKX0V6sGCq77pbdeibL6KgulLp4802h

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id_activity integer NOT NULL,
    name character varying(150) NOT NULL,
    description text NOT NULL,
    date date NOT NULL,
    start_time character varying(10) NOT NULL,
    end_time character varying(10) NOT NULL,
    capacity integer DEFAULT 20 NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    registration_deadline timestamp without time zone NOT NULL,
    is_certifiable boolean DEFAULT false NOT NULL,
    min_attendance_percentage integer DEFAULT 80,
    image_url character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    id_type integer,
    id_location integer,
    id_organizer integer NOT NULL
);


--
-- Name: activities_id_activity_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activities_id_activity_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activities_id_activity_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activities_id_activity_seq OWNED BY public.activities.id_activity;


--
-- Name: activity_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_types (
    id_type integer NOT NULL,
    name character varying(100) NOT NULL,
    requires_enrollment boolean DEFAULT true NOT NULL
);


--
-- Name: activity_types_id_type_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_types_id_type_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_types_id_type_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_types_id_type_seq OWNED BY public.activity_types.id_type;


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendances (
    id_attendance integer NOT NULL,
    registration_date timestamp without time zone DEFAULT now() NOT NULL,
    status character varying(20) NOT NULL,
    id_user integer NOT NULL,
    id_session integer NOT NULL
);


--
-- Name: attendances_id_attendance_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendances_id_attendance_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendances_id_attendance_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendances_id_attendance_seq OWNED BY public.attendances.id_attendance;


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id_certificate integer NOT NULL,
    issue_date timestamp without time zone DEFAULT now() NOT NULL,
    certificate_code character varying(128) NOT NULL,
    id_user integer NOT NULL,
    id_activity integer NOT NULL
);


--
-- Name: certificates_id_certificate_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certificates_id_certificate_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificates_id_certificate_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certificates_id_certificate_seq OWNED BY public.certificates.id_certificate;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id_enrollment integer NOT NULL,
    enrollment_date timestamp without time zone DEFAULT now() NOT NULL,
    id_user integer NOT NULL,
    id_activity integer NOT NULL
);


--
-- Name: enrollments_id_enrollment_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrollments_id_enrollment_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_enrollment_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrollments_id_enrollment_seq OWNED BY public.enrollments.id_enrollment;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id_location integer NOT NULL,
    name character varying(150) NOT NULL,
    building character varying(100)
);


--
-- Name: locations_id_location_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_location_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_location_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_location_seq OWNED BY public.locations.id_location;


--
-- Name: review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review (
    id_review integer NOT NULL,
    id_user integer NOT NULL,
    id_activity integer NOT NULL,
    rating integer NOT NULL,
    comment character varying(500),
    date timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "CHK_8374c8605cf880006a35058db4" CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: review_id_review_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_id_review_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_id_review_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_id_review_seq OWNED BY public.review.id_review;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id_role integer NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: roles_id_role_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_role_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_role_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_role_seq OWNED BY public.roles.id_role;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id_session integer NOT NULL,
    session_date date NOT NULL,
    start_time character varying(10),
    end_time character varying(10),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    id_activity integer NOT NULL
);


--
-- Name: sessions_id_session_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_session_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_session_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_session_seq OWNED BY public.sessions.id_session;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id_user integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    id_role integer NOT NULL
);


--
-- Name: users_id_user_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_user_seq OWNED BY public.users.id_user;


--
-- Name: activities id_activity; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities ALTER COLUMN id_activity SET DEFAULT nextval('public.activities_id_activity_seq'::regclass);


--
-- Name: activity_types id_type; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_types ALTER COLUMN id_type SET DEFAULT nextval('public.activity_types_id_type_seq'::regclass);


--
-- Name: attendances id_attendance; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id_attendance SET DEFAULT nextval('public.attendances_id_attendance_seq'::regclass);


--
-- Name: certificates id_certificate; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id_certificate SET DEFAULT nextval('public.certificates_id_certificate_seq'::regclass);


--
-- Name: enrollments id_enrollment; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id_enrollment SET DEFAULT nextval('public.enrollments_id_enrollment_seq'::regclass);


--
-- Name: locations id_location; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id_location SET DEFAULT nextval('public.locations_id_location_seq'::regclass);


--
-- Name: review id_review; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review ALTER COLUMN id_review SET DEFAULT nextval('public.review_id_review_seq'::regclass);


--
-- Name: roles id_role; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_role SET DEFAULT nextval('public.roles_id_role_seq'::regclass);


--
-- Name: sessions id_session; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id_session SET DEFAULT nextval('public.sessions_id_session_seq'::regclass);


--
-- Name: users id_user; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id_user SET DEFAULT nextval('public.users_id_user_seq'::regclass);


--
-- Name: attendances PK_22f2182c3eeb66783acc78cdd83; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "PK_22f2182c3eeb66783acc78cdd83" PRIMARY KEY (id_attendance);


--
-- Name: locations PK_2e73b1fc5b967273d2c7dd853b7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT "PK_2e73b1fc5b967273d2c7dd853b7" PRIMARY KEY (id_location);


--
-- Name: certificates PK_39c31e90057db00f36921cad383; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "PK_39c31e90057db00f36921cad383" PRIMARY KEY (id_certificate);


--
-- Name: roles PK_3ebdb96dd6787bda0e3c8f89d66; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_3ebdb96dd6787bda0e3c8f89d66" PRIMARY KEY (id_role);


--
-- Name: activity_types PK_6550325a82b491d490bd19832f2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_types
    ADD CONSTRAINT "PK_6550325a82b491d490bd19832f2" PRIMARY KEY (id_type);


--
-- Name: sessions PK_858bc8fe367b57b2de3ad3316bd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "PK_858bc8fe367b57b2de3ad3316bd" PRIMARY KEY (id_session);


--
-- Name: activities PK_8bd879b3d37dfbed063cdda0a72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "PK_8bd879b3d37dfbed063cdda0a72" PRIMARY KEY (id_activity);


--
-- Name: review PK_9e5845ef64f912a98908bb1aa0a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "PK_9e5845ef64f912a98908bb1aa0a" PRIMARY KEY (id_review);


--
-- Name: enrollments PK_a23c202dc4b6864ff1fa99ab5a4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "PK_a23c202dc4b6864ff1fa99ab5a4" PRIMARY KEY (id_enrollment);


--
-- Name: users PK_fbb07fa6fbd1d74bee9782fb945; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_fbb07fa6fbd1d74bee9782fb945" PRIMARY KEY (id_user);


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: certificates UQ_8bbce0247731364f786e67b08fd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "UQ_8bbce0247731364f786e67b08fd" UNIQUE (certificate_code);


--
-- Name: activity_types UQ_949058659a81a853dfcf2a8d75f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_types
    ADD CONSTRAINT "UQ_949058659a81a853dfcf2a8d75f" UNIQUE (name);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: attendances UQ_attendance_user_session; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "UQ_attendance_user_session" UNIQUE (id_user, id_session);


--
-- Name: certificates UQ_certificate_user_activity; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "UQ_certificate_user_activity" UNIQUE (id_user, id_activity);


--
-- Name: enrollments UQ_enrollment_user_activity; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "UQ_enrollment_user_activity" UNIQUE (id_user, id_activity);


--
-- Name: review UQ_review_user_activity; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "UQ_review_user_activity" UNIQUE (id_user, id_activity);


--
-- Name: attendances FK_127f4147870077d5bd35685d396; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_127f4147870077d5bd35685d396" FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: certificates FK_16dd07ae2805317359a8b1458e9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "FK_16dd07ae2805317359a8b1458e9" FOREIGN KEY (id_activity) REFERENCES public.activities(id_activity);


--
-- Name: sessions FK_1ea55bfa12b2c05c719d6f6ab8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "FK_1ea55bfa12b2c05c719d6f6ab8a" FOREIGN KEY (id_activity) REFERENCES public.activities(id_activity);


--
-- Name: enrollments FK_2b1f84c8c2fb4a759c3af77b2d1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_2b1f84c8c2fb4a759c3af77b2d1" FOREIGN KEY (id_user) REFERENCES public.users(id_user) ON DELETE CASCADE;


--
-- Name: activities FK_33e5372f57c260b1f0ddcfdee94; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_33e5372f57c260b1f0ddcfdee94" FOREIGN KEY (id_location) REFERENCES public.locations(id_location);


--
-- Name: review FK_429274aa7d82b597fd77643fe0c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "FK_429274aa7d82b597fd77643fe0c" FOREIGN KEY (id_activity) REFERENCES public.activities(id_activity);


--
-- Name: enrollments FK_4c56109bcc8b600a52f878b78dc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_4c56109bcc8b600a52f878b78dc" FOREIGN KEY (id_activity) REFERENCES public.activities(id_activity) ON DELETE CASCADE;


--
-- Name: certificates FK_52c01b57846b5a2e649f91d0538; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "FK_52c01b57846b5a2e649f91d0538" FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: activities FK_867ae7e6a7c69f6b629b70a2517; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_867ae7e6a7c69f6b629b70a2517" FOREIGN KEY (id_type) REFERENCES public.activity_types(id_type);


--
-- Name: activities FK_88ca3c3114310105e7378def1f9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_88ca3c3114310105e7378def1f9" FOREIGN KEY (id_organizer) REFERENCES public.users(id_user);


--
-- Name: review FK_df6b57f9a3033a36299d6eb6fc3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "FK_df6b57f9a3033a36299d6eb6fc3" FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: attendances FK_eec274357e763a48a1b10c1430a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "FK_eec274357e763a48a1b10c1430a" FOREIGN KEY (id_session) REFERENCES public.sessions(id_session);


--
-- Name: users FK_f8a3754f51a266a160e71d261f8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_f8a3754f51a266a160e71d261f8" FOREIGN KEY (id_role) REFERENCES public.roles(id_role);


--
-- PostgreSQL database dump complete
--

\unrestrict sp2hYid81Q1AWQ7BPLaQq1yy4KdAN15hFKX0V6sGCq77pbdeibL6KgulLp4802h

