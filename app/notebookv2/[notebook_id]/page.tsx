import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { NotebookTitle } from "@/components/notebook-title"
import { getNotebook } from "@/server/domain/notebooks"
import { getSession } from "@auth0/nextjs-auth0/edge"
import { SetBreadcrumb } from '@/components/set-breadcrumb'
import { Skeleton } from "@/components/ui/skeleton"
import { NotebookInstructions } from "@/components/notebook-instructions"

// Lazy load components
const NotebookClientWrapper = dynamic(() => import('./notebook-client-wrapper').then(mod => ({ default: mod.NotebookClientWrapper })), {
  loading: () => <div>Loading...</div>
})

const NotebookPanels = dynamic(() => import('@/components/notebook-panels').then(mod => ({ default: mod.NotebookPanels })), {
  loading: () => (
    <div className="p-4">
      <Skeleton className="h-[calc(100vh-8rem)] w-full" />
    </div>
  )
})

export const runtime = 'edge';
// export const dynamic = 'force-dynamic';

async function getServerNotebook(id: string) {
  const session = await getSession();
  if (!session?.user) return null;
  return getNotebook(id, session.user.sub);
}

export default async function NotebookLayout({ params }: { params: { notebook_id: string } }) {
  const notebook = await getServerNotebook(params.notebook_id);

  if (!notebook) {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading notebook...</div>}>
      <NotebookClientWrapper>
        <div className="min-h-screen__ bg-background text-foreground">
          <SetBreadcrumb
            breadcrumbs={[
              { label: "Home", route: "/" },
              { label: notebook.title, route: `/notebooks/${notebook.id}` },
            ]}
          />
          <header className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <NotebookTitle
                  notebookId={notebook.id}
                  initialTitle={notebook.title}
                  description={notebook.description}
                  url={notebook.url}
                />
              </div>
            </div>
            <NotebookInstructions 
              notebookId={notebook.id}
              initialInstructions={notebook.instructions}
            />
          </header>
          <div className="grid h-[calc(100vh-8rem)] grid-cols-1">
            <Suspense fallback={
              <div className="p-4">
                <Skeleton className="h-[calc(100vh-8rem)] w-full" />
              </div>
            }>
              <NotebookPanels />
            </Suspense>
          </div>
        </div>
      </NotebookClientWrapper>
    </Suspense>
  )
}

