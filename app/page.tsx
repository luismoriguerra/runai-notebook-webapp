import { SetBreadcrumb } from "@/components/set-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Grid, List, FileText } from "lucide-react";
import { getSession } from "@auth0/nextjs-auth0/edge";
import { getNotebooks } from "@/server/domain/notebooks";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { NotebookDeleteAction } from "@/components/notebook-delete-action";
import { CreateNotebookButton } from "@/components/create-notebook-button";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
async function getServerNotebooks() {
  const session = await getSession();
  if (!session?.user) return [];
  return getNotebooks(session.user.sub);
}

export default async function Home() {
  const notebooks = await getServerNotebooks();

  return (
    <div className="min-h-screen p-8">
      <SetBreadcrumb breadcrumbs={[{ label: "Home", route: "/" }]} />

      <h1 className="text-4xl font-bold text-blue-500 mb-8">Welcome to NotebookLM</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-6">My Notebooks</h2>

        <div className="flex justify-between items-center mb-6">
          <CreateNotebookButton />

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Grid size={16} />
            </Button>
            <Button variant="outline" size="icon">
              <List size={16} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Most recent</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Most recent</DropdownMenuItem>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notebooks.map((notebook) => (
            <Card key={notebook.id} className="bg-gray-700">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="p-2 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <NotebookDeleteAction 
                      notebookId={notebook.id}
                      notebookTitle={notebook.title}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  <Link href={`/notebookv2/${notebook.id}`} className="hover:text-blue-400 transition-colors">
                    {notebook.title}
                  </Link>
                </h3>
                <p className="text-sm text-gray-400">{formatDate(notebook.created_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
