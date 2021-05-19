import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
// import { format } from 'date-fns';
// import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
// import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>
      <main className={styles.Container}>
        <img src="/images/Logo.svg" alt="space traveling logo" />
        {postsPagination.results.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.posts}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <div className={styles.postInfo}>
                <time>
                  <FiCalendar className={styles.icon} />
                  {post.first_publication_date}
                </time>
                <address className="author">
                  <FiUser className={styles.icon} /> {post.data.author}
                </address>
              </div>
            </a>
          </Link>
        ))}
        <a className={styles.loadMore}>Carregar mais posts</a>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 3,
      page: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};
