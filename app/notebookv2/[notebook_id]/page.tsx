import { NotebookTitle } from "@/components/notebook-title"
import { getNotebook } from "@/server/domain/notebooks"
import { getSession } from "@auth0/nextjs-auth0/edge"
import { SetBreadcrumb } from '@/components/set-breadcrumb'
import { NotebookClientWrapper } from './notebook-client-wrapper'
import { NotebookPanels } from '@/components/notebook-panels'
import { NotebookInstructions } from "@/components/notebook-instructions"

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
    return null; // Or handle the error case appropriately
  }

  return (
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
            {/* <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Share className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div> */}
          </div>
          <NotebookInstructions 
            notebookId={notebook.id}
            initialInstructions={notebook.instructions}
          />
        </header>
        <div className="grid h-[calc(100vh-8rem)] grid-cols-1">
          <NotebookPanels />
        </div>
      </div>
    </NotebookClientWrapper>
  )
}

