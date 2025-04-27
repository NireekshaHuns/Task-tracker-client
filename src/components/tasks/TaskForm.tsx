import { useState, useEffect } from "react";
import { Task, CreateTaskData } from "../../types/task";
import { Button } from ".././ui/button";
import { Input } from ".././ui/input";
import { Label } from ".././ui/label";
import { Textarea } from ".././ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from ".././ui/dialog";
import { Sparkles } from "lucide-react";
import { generateTaskDescription } from "../utils/aiDescription";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData) => void;
  initialData?: Task;
  isSubmitting?: boolean;
}

// Form component to create or edit a task
const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: TaskFormProps) => {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: "",
    description: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || "",
        description: initialData?.description || "",
      });
    }
  }, [isOpen, initialData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Generate enhanced description using AI
  const handleAIGenerate = async () => {
    if (!formData.description?.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      const userPrompt = formData.description;
      setFormData((prev) => ({
        ...prev,
        description: "Generating enhanced description...",
      }));
      const generatedDescription = await generateTaskDescription(userPrompt);
      setFormData((prev) => ({
        ...prev,
        description: generatedDescription,
      }));
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        description:
          prev.description === "Generating enhanced description..."
            ? formData.description
            : prev.description,
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Description (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1 px-2 py-1 h-8"
                onClick={handleAIGenerate}
                disabled={isGenerating || !formData.description?.trim()}
                title={
                  !formData.description?.trim()
                    ? "Enter a description first"
                    : "Enhance with AI"
                }
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isGenerating ? "Generating..." : "Enhance with AI"}
                </span>
              </Button>
            </div>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Enter a description or leave blank (optional)"
              disabled={isGenerating}
            />
            {isGenerating && (
              <div className="text-xs text-gray-500 animate-pulse">
                AI is enhancing your description...
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isGenerating}>
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
