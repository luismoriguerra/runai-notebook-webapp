import { getSession } from "@auth0/nextjs-auth0/edge";
import { getNotebook } from "@/server/domain/notebooks";
import { getChats } from "@/server/domain/chats";
import { SetBreadcrumb } from "@/components/set-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FileText, Link as LinkIcon, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChatsSection from "@/components/notebook/chats-section";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function getServerNotebook(id: string) {
  const session = await getSession();
  if (!session?.user) return null;
  return getNotebook(id, session.user.sub);
}

async function getServerChats(notebookId: string) {
  const session = await getSession();
  if (!session?.user) return [];
  return getChats(session.user.sub, notebookId);
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function NotebookPage({ params }: PageProps) {
  const notebook = await getServerNotebook(params.id);
  
  if (!notebook) {
    notFound();
  }

  const chats = await getServerChats(params.id);

  return (
    <div className="min-h-screen p-8">
      <SetBreadcrumb
        breadcrumbs={[
          { label: "Home", route: "/" },
          { label: notebook.title, route: `/notebooks/${notebook.id}` },
        ]}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-500">{notebook.title}</h1>
          <p className="text-gray-400 mt-2">Created {formatDate(notebook.created_at)}</p>
        </div>
        <div>
          <Button className="gap-2" asChild>
            <Link href={`/notebooks/${notebook.id}/notes/new`}>
              <Plus size={16} />
              New Note
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              About this notebook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{notebook.description}</p>
            {notebook.url && (
              <a
                href={notebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-4"
              >
                <LinkIcon size={16} />
                View source
              </a>
            )}
          </CardContent>
        </Card>

        <ChatsSection notebookId={notebook.id} initialChats={chats} />

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Notes list will be added here */}
            <p className="text-gray-400">No notes yet. Create your first note to get started.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 