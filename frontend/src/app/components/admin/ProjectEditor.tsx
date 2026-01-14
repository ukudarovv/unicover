import { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, Image as ImageIcon, Settings } from 'lucide-react';
import { Project, ProjectDetail, projectsService } from '../../services/projects';
import { ProjectCategory, ProjectImage } from '../../types/projects';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ProjectCategoryEditor } from './ProjectCategoryEditor';

interface ProjectEditorProps {
  project?: Project | ProjectDetail;
  onSave: (project: Partial<Project>, imageFile?: File) => Promise<Project>;
  onCancel: () => void;
}

export function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    category_id: undefined,
    location: '',
    year: new Date().getFullYear(),
    description: '',
    full_description: '',
    characteristics: {},
    timeline: '',
    team: '',
    is_published: true,
    order: 0,
  });
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [charKey, setCharKey] = useState('');
  const [charValue, setCharValue] = useState('');
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | undefined>(undefined);

  const fetchCategories = async () => {
    try {
      const data = await projectsService.getProjectCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (project) {
      const projectDetail = project as ProjectDetail;
      setFormData({
        title: project.title || '',
        category_id: project.category?.id ? parseInt(project.category.id) : undefined,
        location: project.location || '',
        year: project.year || new Date().getFullYear(),
        description: project.description || '',
        full_description: projectDetail.full_description || '',
        characteristics: projectDetail.characteristics || {},
        timeline: projectDetail.timeline || '',
        team: projectDetail.team || '',
        is_published: project.is_published !== undefined ? project.is_published : true,
        order: project.order || 0,
      });
      
      if (project.image_url || project.image) {
        setImagePreview(project.image_url || project.image);
      }
      
      if (projectDetail.gallery_images) {
        setGalleryImages(projectDetail.gallery_images);
      }
    }
  }, [project]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewGalleryFiles([...newGalleryFiles, ...files]);
      // Reset the input so the same files can be selected again
      e.target.value = '';
    }
  };

  const removeGalleryFile = (index: number) => {
    setNewGalleryFiles(newGalleryFiles.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = async (imageId: string) => {
    if (!project?.id) return;
    
    try {
      await projectsService.deleteProjectImage(project.id, imageId);
      setGalleryImages(galleryImages.filter(img => img.id !== imageId));
      toast.success('Изображение удалено');
    } catch (error: any) {
      console.error('Failed to delete image:', error);
      toast.error('Ошибка удаления изображения');
    }
  };

  const handleAddCharacteristic = () => {
    if (charKey.trim() && charValue.trim()) {
      setFormData(prev => ({
        ...prev,
        characteristics: {
          ...(prev.characteristics || {}),
          [charKey.trim()]: charValue.trim(),
        },
      }));
      setCharKey('');
      setCharValue('');
    }
  };

  const handleRemoveCharacteristic = (key: string) => {
    const newChars = { ...(formData.characteristics || {}) };
    delete newChars[key];
    setFormData(prev => ({ ...prev, characteristics: newChars }));
  };

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryEditor(true);
  };

  const handleSaveCategory = async (category: Partial<ProjectCategory>) => {
    try {
      if (editingCategory) {
        await projectsService.updateCategory(editingCategory.id, category);
      } else {
        await projectsService.createCategory(category);
      }
      // Refresh categories list
      await fetchCategories();
      setShowCategoryEditor(false);
      setEditingCategory(undefined);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast.error('Название проекта обязательно');
      return;
    }

    try {
      setLoading(true);
      
      // Save project first - onSave will return the saved project
      const savedProject = await onSave(formData, imageFile || undefined);
      
      // Upload gallery images if any (for both new and existing projects)
      if (newGalleryFiles.length > 0 && savedProject.id) {
        console.log(`Uploading ${newGalleryFiles.length} gallery images for project ${savedProject.id}`);
        let successCount = 0;
        for (let i = 0; i < newGalleryFiles.length; i++) {
          try {
            console.log(`Uploading gallery image ${i + 1}/${newGalleryFiles.length}...`);
            const result = await projectsService.addProjectImage(String(savedProject.id), newGalleryFiles[i], galleryImages.length + i);
            console.log(`Gallery image ${i + 1} uploaded successfully:`, result);
            successCount++;
          } catch (error: any) {
            console.error(`Failed to upload gallery image ${i + 1}:`, error);
            toast.warning(`Не удалось загрузить изображение ${i + 1}: ${error.message || 'Ошибка загрузки'}`);
          }
        }
        if (successCount > 0) {
          toast.success(`Загружено изображений: ${successCount} из ${newGalleryFiles.length}`);
          // Reload project to get updated gallery
          try {
            console.log('Reloading project to get updated gallery...');
            const updatedProject = await projectsService.getProject(savedProject.id);
            console.log('Updated project gallery:', updatedProject.gallery_images);
            if (updatedProject.gallery_images) {
              setGalleryImages(updatedProject.gallery_images);
            }
          } catch (err) {
            console.error('Failed to reload project:', err);
          }
        } else {
          toast.error('Не удалось загрузить ни одного изображения');
        }
        // Clear new gallery files after upload attempt
        setNewGalleryFiles([]);
      }
    } catch (error: any) {
      console.error('Failed to save project:', error);
      toast.error('Ошибка сохранения проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {project ? 'Редактировать проект' : 'Создать проект'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Название проекта <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Категория
                </label>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  title="Управление категориями"
                >
                  <Settings className="w-4 h-4" />
                  <span>Управление</span>
                </button>
              </div>
              <select
                id="category_id"
                value={formData.category_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  category_id: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Без категории</option>
                {categories.filter(cat => cat.is_active).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Год <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="year"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="2000"
                max={new Date().getFullYear() + 10}
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Местоположение <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Главное изображение
            </label>
            {imagePreview && (
              <div className="mb-4 relative inline-block">
                <ImageWithFallback
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Загрузить изображение</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Удалить</span>
                </button>
              )}
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Краткое описание <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 mb-1">
              Полное описание
            </label>
            <textarea
              id="full_description"
              value={formData.full_description}
              onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Characteristics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Характеристики проекта
            </label>
            <div className="space-y-2 mb-4">
              {Object.entries(formData.characteristics || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 font-medium text-gray-700">{key}:</span>
                  <span className="flex-1 text-gray-600">{String(value)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCharacteristic(key)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Название характеристики"
                value={charKey}
                onChange={(e) => setCharKey(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Значение"
                  value={charValue}
                  onChange={(e) => setCharValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCharacteristic())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCharacteristic}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
              Сроки выполнения
            </label>
            <input
              type="text"
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Команда проекта
            </label>
            <textarea
              id="team"
              value={formData.team}
              onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Галерея изображений
            </label>
            {/* Existing images */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <ImageWithFallback
                      src={img.image_url || img.image}
                      alt="Gallery"
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* New images to upload */}
            {newGalleryFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {newGalleryFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryFile(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors inline-block">
              <ImageIcon className="w-4 h-4" />
              <span>Добавить изображения в галерею</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFilesChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Порядок отображения
              </label>
              <input
                type="number"
                id="order"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Опубликован</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
          </div>
        </form>
      </div>

      {showCategoryEditor && (
        <ProjectCategoryEditor
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setShowCategoryEditor(false);
            setEditingCategory(undefined);
          }}
        />
      )}
    </div>
  );
}


