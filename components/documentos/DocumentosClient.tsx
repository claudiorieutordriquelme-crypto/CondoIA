'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  FolderOpen,
  File,
  Clock,
  CheckCircle2,
  X,
  Eye
} from 'lucide-react'
import type { Documento } from '@/types'

interface DocumentosClientProps {
  documentos: Documento[]
  canUpload: boolean
  condominioId: string
  userRole: string
}

const TIPO_DOCUMENTO_LABELS: Record<string, string> = {
  acta: 'Acta',
  reglamento: 'Reglamento',
  financiero: 'Documento Financiero',
  contrato: 'Contrato',
  correspondencia: 'Correspondencia',
  otro: 'Otro'
}

const TIPO_DOCUMENTO_COLORS: Record<string, string> = {
  acta: 'bg-purple-900/20 text-purple-300 border-purple-500/30',
  reglamento: 'bg-blue-900/20 text-blue-300 border-blue-500/30',
  financiero: 'bg-green-900/20 text-green-300 border-green-500/30',
  contrato: 'bg-orange-900/20 text-orange-300 border-orange-500/30',
  correspondencia: 'bg-pink-900/20 text-pink-300 border-pink-500/30',
  otro: 'bg-slate-900/20 text-slate-300 border-slate-500/30'
}

export function DocumentosClient({
  documentos,
  canUpload,
  condominioId,
  userRole
}: DocumentosClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null)

  // Filter documents based on search and category
  const filteredDocumentos = useMemo(() => {
    return documentos.filter((doc) => {
      const matchesSearch = doc.titulo
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === null || doc.tipo_documento === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [documentos, searchTerm, selectedCategory])

  const categories = [
    { id: null, label: 'Todos', count: documentos.length },
    {
      id: 'acta',
      label: 'Actas',
      count: documentos.filter((d) => d.tipo_documento === 'acta').length
    },
    {
      id: 'reglamento',
      label: 'Reglamentos',
      count: documentos.filter((d) => d.tipo_documento === 'reglamento').length
    },
    {
      id: 'financiero',
      label: 'Financieros',
      count: documentos.filter((d) => d.tipo_documento === 'financiero').length
    },
    {
      id: 'contrato',
      label: 'Contratos',
      count: documentos.filter((d) => d.tipo_documento === 'contrato').length
    },
    {
      id: 'correspondencia',
      label: 'Correspondencia',
      count: documentos.filter((d) => d.tipo_documento === 'correspondencia')
        .length
    }
  ]

  const handleDownload = (doc: Documento) => {
    if (doc.archivo_url) {
      const link = document.createElement('a')
      link.href = doc.archivo_url
      link.download = doc.titulo
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '—'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-700">
        {categories.map((category) => (
          <button
            key={category.id || 'todos'}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all min-h-[44px] ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            {category.label}
            <span className="ml-2 text-sm opacity-75">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Search and Upload Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar documentos por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap min-h-[44px]"
          >
            <Upload className="w-5 h-5" />
            Subir Documento
          </button>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocumentos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocumentos.map((doc) => (
            <div
              key={doc.id}
              className="card bg-slate-800 border-slate-700 hover:border-slate-600 transition-all group cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              {/* Document Type Badge */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border ${TIPO_DOCUMENTO_COLORS[doc.tipo_documento] || TIPO_DOCUMENTO_COLORS['otro']}`}
                >
                  <FolderOpen className="w-3 h-3" />
                  {TIPO_DOCUMENTO_LABELS[doc.tipo_documento] || 'Documento'}
                </div>

                {doc.firmado && (
                  <span title="Firmado digitalmente"><CheckCircle2 className="w-5 h-5 text-green-400" /></span>
                )}
              </div>

              {/* Document Title */}
              <h3 className="text-white font-semibold text-base mb-3 line-clamp-2 group-hover:text-blue-300 transition">
                {doc.titulo}
              </h3>

              {/* Document Meta */}
              <div className="space-y-2 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{formatDate(doc.creado_en)}</span>
                </div>

                {doc.firmado && doc.fecha_firma && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
                    <span>Firmado: {formatDate(doc.fecha_firma)}</span>
                  </div>
                )}

                {doc.firmado_por && (
                  <div className="flex items-center gap-2 text-xs">
                    <span>Por: {doc.firmado_por}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-700">
                {doc.archivo_url && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(doc)
                      }}
                      className="flex-1 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition flex items-center justify-center gap-2 min-h-[44px]"
                      title="Descargar documento"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(doc.archivo_url, '_blank')
                      }}
                      className="flex-1 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition flex items-center justify-center gap-2 min-h-[44px]"
                      title="Ver documento"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="card bg-slate-800 border-slate-700 py-16 text-center">
          <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || selectedCategory
              ? 'No se encontraron documentos'
              : 'Sin documentos'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm
              ? 'Intenta cambiar tu búsqueda'
              : selectedCategory
                ? `No hay documentos en esta categoría`
                : 'Los documentos compartidos aparecerán aquí'}
          </p>

          {canUpload && !selectedCategory && !searchTerm && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary inline-flex items-center gap-2 min-h-[44px]"
            >
              <Upload className="w-5 h-5" />
              Subir Primer Documento
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && canUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card bg-slate-800 border-slate-700 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-400" />
                Subir Documento
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadError('')
                }}
                className="p-2 hover:bg-slate-700 rounded transition min-h-[44px]"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Selecciona el tipo de documento y carga el archivo. Los documentos pueden ser
              firmados digitalmente según Ley 19.799.
            </p>

            {uploadError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3 mb-4 text-red-300 text-sm">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Documento
                </label>
                <select className="input bg-slate-700 border-slate-600 text-white w-full">
                  <option value="acta">Acta</option>
                  <option value="reglamento">Reglamento</option>
                  <option value="financiero">Documento Financiero</option>
                  <option value="contrato">Contrato</option>
                  <option value="correspondencia">Correspondencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Título del Documento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Acta Asamblea Extraordinaria 2026"
                  className="input bg-slate-700 border-slate-600 text-white placeholder-slate-500 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Archivo
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, DOC, DOCX (máx. 10 MB)
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadError('')
                  }}
                  className="flex-1 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  disabled={isUploading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isUploading ? 'Subiendo...' : 'Subir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="card bg-slate-800 border-slate-700 max-w-2xl w-full max-h-96 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedDoc.titulo}
                </h2>
                <div
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border ${TIPO_DOCUMENTO_COLORS[selectedDoc.tipo_documento] || TIPO_DOCUMENTO_COLORS['otro']}`}
                >
                  {TIPO_DOCUMENTO_LABELS[selectedDoc.tipo_documento] || 'Documento'}
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-slate-700 rounded transition min-h-[44px]"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-slate-400 text-sm mb-6 py-4 border-y border-slate-700">
              <div className="flex justify-between">
                <span>Fecha de creación:</span>
                <span className="text-white">{formatDate(selectedDoc.creado_en)}</span>
              </div>

              {selectedDoc.firmado && (
                <>
                  <div className="flex justify-between">
                    <span>Estado de Firma:</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Firmado digitalmente
                    </span>
                  </div>
                  {selectedDoc.fecha_firma && (
                    <div className="flex justify-between">
                      <span>Fecha de firma:</span>
                      <span className="text-white">{formatDate(selectedDoc.fecha_firma)}</span>
                    </div>
                  )}
                  {selectedDoc.firmado_por && (
                    <div className="flex justify-between">
                      <span>Firmado por:</span>
                      <span className="text-white">{selectedDoc.firmado_por}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              {selectedDoc.archivo_url && (
                <>
                  <button
                    onClick={() => {
                      handleDownload(selectedDoc)
                      setSelectedDoc(null)
                    }}
                    className="flex-1 px-4 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Download className="w-5 h-5" />
                    Descargar
                  </button>

                  <button
                    onClick={() => {
                      window.open(selectedDoc.archivo_url, '_blank')
                      setSelectedDoc(null)
                    }}
                    className="flex-1 px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Eye className="w-5 h-5" />
                    Ver en navegador
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
