import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";

const FormSchema = insertProductSchema.extend({
  priceDisplay: z
    .string()
    .transform((v) => v.replace(/[^0-9]/g, ""))
    .refine((v) => v.length > 0, { message: "Price is required" }),
}).omit({ price: true });

type FormValues = z.infer<typeof FormSchema> & { price?: number };

export default function AdminProductForm() {
  const { t } = useTranslation();
  const { me, loading } = useAuth();
  const isNew = !!useRoute("/admin/products/new")[0];
  const [, params] = useRoute("/admin/products/:id/edit");
  const productId = params?.id;
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { data: existing } = useQuery<Product>({
    queryKey: productId ? ["/api/products", productId] : ["/api/products", null],
    enabled: !!productId,
  });

  const defaultValues = useMemo(() => {
    if (!existing) return {
      name: "",
      description: "",
      category: "rings",
      imageUrl: "",
      images: [],
      material: "",
      isPreOrder: false,
      inStock: true,
      sizes: null,
      priceDisplay: "",
    } as any;
    return {
      name: existing.name,
      description: existing.description,
      category: existing.category,
      imageUrl: existing.imageUrl,
      images: existing.images || [],
      material: existing.material,
      isPreOrder: existing.isPreOrder,
      inStock: existing.inStock,
      sizes: existing.sizes,
      priceDisplay: String(Math.round((existing.price || 0) / 100)),
    } as any;
  }, [existing]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema as any),
    defaultValues,
    values: defaultValues,
  });

  useEffect(() => {
    document.title = isNew ? t('admin.addNewProductTitle') : t('admin.editProductTitle');
  }, [isNew, t]);

  useEffect(() => {
    if (existing?.imageUrl) {
      setImagePreview(existing.imageUrl);
    }
  }, [existing]);

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image size must be less than 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue('imageUrl', base64String);
        setImagePreview(base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        toast({ title: 'Error', description: 'Failed to read image file', variant: 'destructive' });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const removeImage = () => {
    setValue('imageUrl', '');
    setImagePreview('');
  };

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const price = parseInt(values.priceDisplay.replace(/[^0-9]/g, ""), 10) * 100;
      const payload: any = {
        ...values,
        price,
      };
      delete payload.priceDisplay;
      if (typeof payload.images === "string") {
        payload.images = payload.images.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (typeof payload.sizes === "string") {
        const list = payload.sizes.split(",").map((s: string) => s.trim()).filter(Boolean);
        payload.sizes = list.length ? list : null;
      }
      const res = await fetch(isNew ? "/api/products" : `/api/products/${productId}` , {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || t('admin.saveFailed'));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t('admin.productSaved') });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setLocation("/admin");
    },
    onError: (e: any) => {
      toast({ title: t('admin.saveFailed'), description: e.message, variant: "destructive" });
    }
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (!me || me.role !== "admin") return <div className="container mx-auto p-6">{t('admin.unauthorized')}</div>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl lg:text-4xl font-light">{isNew ? t('admin.addNewProductTitle') : t('admin.editProductTitle')}</h1>
        <Link href="/admin"><Button variant="outline">{t('admin.backToDashboard')}</Button></Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload Section - Moved to Top */}
        <div className="border rounded-lg p-6 bg-card">
          <Label htmlFor="imageUpload" className="text-lg font-semibold mb-4 block">{t('admin.productImage')}</Label>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative w-full aspect-square max-w-md mx-auto border rounded-lg overflow-hidden bg-accent">
                <img src={imagePreview} alt="Product preview" className="w-full h-full object-contain" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-base font-medium mb-2">{t('admin.uploadImageText')}</p>
                <p className="text-sm text-muted-foreground mb-4">Drag and drop your image here, or</p>
              </div>
            )}
            <div className="flex items-center justify-center">
              <label htmlFor="imageUpload" className="relative">
                <Button 
                  type="button" 
                  variant="default" 
                  className="cursor-pointer"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? t('common.uploading') : 'Choose File'}
                  </span>
                </Button>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
            {uploading && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('common.uploading')}</p>
              </div>
            )}
            {errors.imageUrl && <p className="text-sm text-red-500 text-center">{errors.imageUrl.message as any}</p>}
          </div>
        </div>

        {/* Rest of the Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t('admin.productNameField')}</Label>
            <Input id="name" placeholder={t('admin.productNamePlaceholder')} {...register("name")} />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message as any}</p>}
          </div>
          <div>
            <Label htmlFor="category">{t('admin.categoryField')}</Label>
            <Select value={watch("category")} onValueChange={(v) => setValue("category", v as any)}>
              <SelectTrigger id="category"><SelectValue placeholder={t('admin.selectCategory')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rings">{t('products.rings')}</SelectItem>
                <SelectItem value="necklaces">{t('products.necklaces')}</SelectItem>
                <SelectItem value="bracelets">{t('products.bracelets')}</SelectItem>
                <SelectItem value="earrings">{t('products.earrings')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message as any}</p>}
          </div>
          <div>
            <Label htmlFor="priceDisplay">{t('admin.priceField')}</Label>
            <Input id="priceDisplay" placeholder={t('admin.pricePlaceholder')} {...register("priceDisplay")} />
            {errors as any && (errors as any).priceDisplay && <p className="text-sm text-red-500 mt-1">{(errors as any).priceDisplay.message as any}</p>}
          </div>
          <div>
            <Label htmlFor="material">{t('admin.materialField')}</Label>
            <Input id="material" placeholder={t('admin.materialPlaceholder')} {...register("material")} />
            {errors.material && <p className="text-sm text-red-500 mt-1">{errors.material.message as any}</p>}
          </div>
          
          <div>
            <Label htmlFor="images">{t('admin.galleryImagesField')}</Label>
            <Input id="images" placeholder={t('admin.galleryImagesPlaceholder')} {...register("images" as any)} />
            <p className="text-xs text-muted-foreground mt-1">{t('admin.galleryImagesNote')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">{t('admin.descriptionField')}</Label>
            <textarea id="description" className="w-full border rounded-md bg-background p-2 min-h-[120px]" {...register("description")} />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message as any}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizes">{t('admin.sizesField')}</Label>
              <Input id="sizes" placeholder={t('admin.sizesPlaceholder')} {...register("sizes" as any)} />
            </div>
            <div>
              <Label htmlFor="stock">{t('admin.stockField')}</Label>
              <Select value={watch("inStock") ? "in" : "out"} onValueChange={(v) => setValue("inStock", v === "in") }>
                <SelectTrigger id="stock"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">{t('admin.inStock')}</SelectItem>
                  <SelectItem value="out">{t('admin.outOfStock')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pre">{t('admin.preOrderField')}</Label>
              <Select value={watch("isPreOrder") ? "yes" : "no"} onValueChange={(v) => setValue("isPreOrder", v === "yes") }>
                <SelectTrigger id="pre"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">{t('admin.no')}</SelectItem>
                  <SelectItem value="yes">{t('admin.yes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isNew ? t('admin.createProduct') : t('admin.saveChanges')}</Button>
            <Link href="/admin"><Button type="button" variant="outline">{t('common.cancel')}</Button></Link>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
}
