"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ComposeCreate() {
  const router = useRouter();
  const create = api.compose.createStackFile.useMutation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    toast.promise(
      create.mutateAsync(
        {
          name,
        },
        {
          onSuccess: () => {
            setOpen(false);
            setName("");
            router.push(`/compose/${name}`);
          },
        },
      ),
      {
        loading: "Creating...",
        success: "Created successfully",
        error: (error) => {
          return error.message;
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new compose</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="compose-create-name" />
          <Input
            id="compose-create-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate}>Create</Button>
      </DialogContent>
    </Dialog>
  );
}
