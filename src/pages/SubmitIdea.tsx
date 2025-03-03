
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DomainCategory, createAllStandardDocuments, createDomainSpecificDocuments, generateTasksFromDocuments } from "@/utils/documentGenerator";
import { processDocumentForTaskCreation } from "@/services/recommendationService";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().min(1, "Please select a deadline"),
  domain: z.enum(["strategy", "data-engineering", "frontend", "backend", "product", "design"]),
});

const SubmitIdea = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<Record<string, string>>({});
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [documentProcessingComplete, setDocumentProcessingComplete] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      deadline: "",
      domain: "product",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to submit an idea",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate standard documents for the selected domain
      const standardDocs = createAllStandardDocuments(
        values.title,
        values.description,
        values.priority,
        values.deadline
      );

      // Generate domain-specific documents
      const domainDocs = createDomainSpecificDocuments(
        values.domain as DomainCategory,
        values.title,
        values.description,
        values.priority,
        values.deadline
      );

      // Combine all documents
      const allDocuments = {
        ...standardDocs,
        ...domainDocs
      };

      setGeneratedDocuments(allDocuments);

      // Generate tasks from documents
      const tasks = generateTasksFromDocuments(allDocuments, values.domain as DomainCategory);
      setGeneratedTasks(tasks);

      // Process documents to extract more insights and recommendations
      for (const [docType, content] of Object.entries(allDocuments)) {
        // Create a file blob from the document content
        const file = new File(
          [content], 
          `${values.domain}-${docType}.md`, 
          { type: "text/markdown" }
        );

        // Process the document using our existing document parsing engine
        if (currentUser?.uid) {
          const result = await processDocumentForTaskCreation(currentUser.uid, file);
          
          if (result.success) {
            // Additional tasks and recommendations have been created and stored in Firebase
            console.log(`Processed document ${docType} with ${result.tasks.length} tasks and ${result.recommendations.length} recommendations`);
          }
        }
      }

      setDocumentProcessingComplete(true);

      toast({
        title: "Success!",
        description: "Your idea has been submitted and documents have been created.",
      });

      // We don't immediately navigate away so the user can see the confirmation
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your idea.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/dashboard")} 
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Submit New Project Idea</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear and concise title for your project idea
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project idea..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed information about your project idea
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="strategy">Strategy</SelectItem>
                            <SelectItem value="data-engineering">Data Engineering</SelectItem>
                            <SelectItem value="frontend">Frontend</SelectItem>
                            <SelectItem value="backend">Backend</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the primary domain for your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the priority level for your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When do you need this project completed?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit Project Idea"}
                  </Button>
                  <FormDescription className="text-center mt-2">
                    This will create standardized documents and tasks for your project
                  </FormDescription>
                </div>
              </form>
            </Form>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Document Generation</CardTitle>
                <CardDescription>
                  Documents that will be created for your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Standard Documents:</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Project Charter</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Product Requirements Document</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>10-Day Execution Calendar</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Sprint Plan</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Domain-Specific Documents:</h3>
                  <div className="text-sm text-muted-foreground">
                    Domain-specific documents will be generated based on your selected domain.
                  </div>
                </div>

                {documentProcessingComplete && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Processing Complete</span>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {Object.keys(generatedDocuments).length} documents created
                      and {generatedTasks.length} tasks generated
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitIdea;
