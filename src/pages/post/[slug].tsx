import { GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      author: string;
      url: string;
    };
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Head>
        <title> Spacetravelling | Post </title>
      </Head>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="images" />
      <main className={styles.container}>
        <article className={styles.post}>
          <h1> {post.data.title} </h1>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar /> 15 Mar 2021
            </time>
            <address className="author">
              <FiUser /> {post.data.banner.author}
            </address>
            <time>
              <FiClock />4 min
            </time>
          </div>
          {post.data.content.map(content => (
            <article key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body.text),
                }}
              />
            </article>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query();
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('post', String(slug), {});

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
        author: RichText.asText(response.data.author),
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: {
            text: [...content.body],
          },
        };
      }),
    },
  };

  // console.log(JSON.stringify(post));

  return {
    props: {
      post,
    },
  };
};
