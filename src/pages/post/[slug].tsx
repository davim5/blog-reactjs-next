/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
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
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }
  const totalWords = post.data.content.reduce((sum, contentItem) => {
    sum += contentItem.heading.split(' ').length;

    const words = contentItem.body.text.map(
      item => item.text.split(' ').length
    );

    words.map(word => (sum += word));

    return sum;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const formattedPost: Post = {
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  };

  return (
    <>
      <Head>
        <title> Spacetravelling | Post </title>
      </Head>
      <Header />
      <img
        className={styles.banner}
        src={formattedPost.data.banner.url}
        alt="images"
      />
      <main className={styles.container}>
        <article className={styles.post}>
          <h1> {RichText.asText(formattedPost.data.title)} </h1>
          <div className={styles.postInfo}>
            <time>
              <FiCalendar /> {formattedPost.first_publication_date}
            </time>
            <address className="author">
              <FiUser /> {RichText.asText(formattedPost.data.banner.author)}
            </address>
            <time>
              <FiClock /> {`${readTime} min`}
            </time>
          </div>
          {formattedPost.data.content.map(content => (
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
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
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
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
        author: response.data.author,
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
    revalidate: 60 * 60,
  };
};
