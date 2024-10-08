"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDockerCompose } from "@/hooks/use-docker-compose";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ComposeCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [composeName, setComposeName] = useState("");
  const { create } = useDockerCompose({ composeName });

  const handleCreate = () =>
    create(() => {
      setOpen(false);
      setComposeName("");
      router.push(`/compose/${composeName}`);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new compose</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="compose-create-name" />
          <Input
            id="compose-create-name"
            value={composeName}
            onChange={(e) => setComposeName(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate}>Create</Button>
      </DialogContent>
    </Dialog>
  );
}
