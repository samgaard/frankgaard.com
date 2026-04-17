export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <div>Post: {params.slug}</div>
}
