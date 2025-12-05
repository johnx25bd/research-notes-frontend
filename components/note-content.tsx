interface NoteContentProps {
  html: string
}

export function NoteContent({ html }: NoteContentProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
