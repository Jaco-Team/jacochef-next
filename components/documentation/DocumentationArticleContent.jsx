"use client";

export default function DocumentationArticleContent({ html }) {
  return (
    <>
      <style
        jsx
        global
      >{`
        .chef-documentation-article-content {
          font-family: Roboto, Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 26px;
          color: #2b2b2b;
          word-break: break-word;
        }

        .chef-documentation-article-content > *:first-child {
          margin-top: 0;
        }

        .chef-documentation-article-content h1,
        .chef-documentation-article-content h2,
        .chef-documentation-article-content h3,
        .chef-documentation-article-content h4 {
          margin: 28px 0 12px !important;
          color: #2b2b2b;
          font-weight: 600;
          line-height: 1.3;
        }

        .chef-documentation-article-content h1 {
          font-size: 28px;
        }

        .chef-documentation-article-content h2 {
          font-size: 22px;
        }

        .chef-documentation-article-content h3 {
          font-size: 18px;
        }

        .chef-documentation-article-content p {
          margin: 0 0 14px;
        }

        .chef-documentation-article-content ul,
        .chef-documentation-article-content ol {
          margin: 0 0 14px;
          padding-left: 24px;
        }

        .chef-documentation-article-content li {
          margin-bottom: 6px;
        }

        .chef-documentation-article-content a {
          color: #dd1a32;
          text-decoration: none;
          border-bottom: 1px solid rgba(221, 26, 50, 0.3);
        }

        .chef-documentation-article-content a:hover {
          border-bottom-color: #dd1a32;
        }

        .chef-documentation-article-content img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 16px 0;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
        }

        .chef-documentation-article-content blockquote {
          margin: 16px 0;
          padding: 12px 16px;
          border-left: 3px solid #dd1a32;
          border-radius: 0 12px 12px 0;
          background: #fff1f3;
          color: #5e5e5e;
        }

        .chef-documentation-article-content code {
          padding: 2px 6px;
          border-radius: 6px;
          background: #f3f3f3;
          font-size: 14px;
        }

        .chef-documentation-article-content pre {
          padding: 12px 16px;
          border-radius: 12px;
          background: #f3f3f3;
          overflow-x: auto;
        }

        .chef-documentation-article-content table {
          width: 100%;
          margin: 16px 0;
          border-collapse: collapse;
          font-size: 14px;
        }

        .chef-documentation-article-content th,
        .chef-documentation-article-content td {
          padding: 10px 12px;
          border: 1px solid #e5e5e5;
          text-align: left;
        }

        .chef-documentation-article-content th {
          background: #f3f3f3;
          font-weight: 600;
        }
      `}</style>
      <div
        className="chef-documentation-article-content"
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    </>
  );
}
