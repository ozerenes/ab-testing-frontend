<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CreateExperimentPayload } from '../api'

interface VariantForm {
  key: string
  name: string
  weight: number
}

const emit = defineEmits<{
  submit: [payload: CreateExperimentPayload]
  cancel: []
}>()

function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'variant'
  )
}

const formData = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
})

const variants = ref<VariantForm[]>([
  { key: 'control', name: 'Control', weight: 50 },
  { key: 'variant_a', name: 'Variant A', weight: 50 },
])

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const totalWeight = computed(() => {
  return variants.value.reduce((sum, v) => sum + (v.weight || 0), 0)
})

const isWeightValid = computed(() => totalWeight.value === 100)

function addVariant() {
  const remainingWeight = 100 - totalWeight.value
  const name = `Variant ${String.fromCharCode(64 + variants.value.length)}`
  variants.value.push({
    key: slugify(name),
    name,
    weight: Math.max(0, remainingWeight),
  })
}

function removeVariant(index: number) {
  if (variants.value.length > 2) {
    variants.value.splice(index, 1)
  }
}

function validateForm(): boolean {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Experiment name is required'
  }

  if (variants.value.length < 2) {
    errors.value.variants = 'At least 2 variants are required'
  }

  const usedKeys = new Set<string>()
  variants.value.forEach((variant, index) => {
    if (!variant.key.trim()) {
      errors.value[`variant_${index}_key`] = 'Key is required'
    } else if (!/^[a-z0-9_]+$/.test(variant.key.trim())) {
      errors.value[`variant_${index}_key`] =
        'Key must be lowercase letters, numbers and underscores only'
    } else if (usedKeys.has(variant.key.trim())) {
      errors.value[`variant_${index}_key`] = 'Key must be unique'
    } else {
      usedKeys.add(variant.key.trim())
    }
    if (!variant.name.trim()) {
      errors.value[`variant_${index}_name`] = 'Variant name is required'
    }
    if (variant.weight < 0 || variant.weight > 100) {
      errors.value[`variant_${index}_weight`] = 'Weight must be between 0-100'
    }
  })

  if (!isWeightValid.value) {
    errors.value.weights = `Total weight must equal 100% (currently ${totalWeight.value}%)`
  }

  if (formData.value.startDate && formData.value.endDate) {
    if (new Date(formData.value.endDate) <= new Date(formData.value.startDate)) {
      errors.value.endDate = 'End date must be after start date'
    }
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const payload: CreateExperimentPayload = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
      variants: variants.value.map((v) => ({
        key: v.key.trim(),
        name: v.name.trim(),
        weight: v.weight,
      })),
      startDate: formData.value.startDate || undefined,
      endDate: formData.value.endDate || undefined,
    }

    emit('submit', payload)
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form class="experiment-form" @submit.prevent="handleSubmit">
    <div class="form-section">
      <h2 class="section-title">Basic Information</h2>

      <div class="form-group">
        <label for="name" class="form-label">
          Experiment Name <span class="required">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.name }"
          placeholder="e.g., Homepage CTA Button Test"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          class="form-textarea"
          rows="3"
          placeholder="Describe the purpose and goals of this experiment..."
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="startDate" class="form-label">Start Date</label>
          <input id="startDate" v-model="formData.startDate" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label for="endDate" class="form-label">End Date</label>
          <input
            id="endDate"
            v-model="formData.endDate"
            type="date"
            class="form-input"
            :class="{ 'input-error': errors.endDate }"
          />
          <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h2 class="section-title">Variants</h2>
        <button type="button" class="btn-secondary btn-sm" @click="addVariant">
          + Add Variant
        </button>
      </div>

      <div v-if="errors.variants" class="error-message mb-3">
        {{ errors.variants }}
      </div>

      <div class="variants-list">
        <div v-for="(variant, index) in variants" :key="index" class="variant-item">
          <div class="variant-header">
            <span class="variant-number">{{ index + 1 }}</span>
            <button
              v-if="variants.length > 2"
              type="button"
              class="btn-remove"
              title="Remove variant"
              @click="removeVariant(index)"
            >
              ×
            </button>
          </div>

          <div class="variant-fields">
            <div class="form-group">
              <label :for="`variant-key-${index}`" class="form-label">
                Key <span class="required">*</span>
              </label>
              <input
                :id="`variant-key-${index}`"
                v-model="variant.key"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors[`variant_${index}_key`] }"
                placeholder="e.g., control, variant_a"
              />
              <span v-if="errors[`variant_${index}_key`]" class="error-message">
                {{ errors[`variant_${index}_key`] }}
              </span>
            </div>

            <div class="form-group">
              <label :for="`variant-name-${index}`" class="form-label">
                Name <span class="required">*</span>
              </label>
              <input
                :id="`variant-name-${index}`"
                v-model="variant.name"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors[`variant_${index}_name`] }"
                placeholder="e.g., Control, Variant A"
              />
              <span v-if="errors[`variant_${index}_name`]" class="error-message">
                {{ errors[`variant_${index}_name`] }}
              </span>
            </div>

            <div class="form-group">
              <label :for="`variant-weight-${index}`" class="form-label">
                Weight (%) <span class="required">*</span>
              </label>
              <input
                :id="`variant-weight-${index}`"
                v-model.number="variant.weight"
                type="number"
                min="0"
                max="100"
                step="1"
                class="form-input"
                :class="{ 'input-error': errors[`variant_${index}_weight`] }"
              />
              <span v-if="errors[`variant_${index}_weight`]" class="error-message">
                {{ errors[`variant_${index}_weight`] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="weight-summary" :class="{ 'weight-invalid': !isWeightValid }">
        <span class="weight-label">Total Weight:</span>
        <span class="weight-value">{{ totalWeight }}%</span>
        <span v-if="!isWeightValid" class="weight-status"> (must equal 100%) </span>
      </div>

      <div v-if="errors.weights" class="error-message">
        {{ errors.weights }}
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn-secondary" :disabled="isSubmitting" @click="handleCancel">
        Cancel
      </button>
      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating...' : 'Create Experiment' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.experiment-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

@media (max-width: 639px) {
  .form-section {
    padding: 1rem;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.section-header .section-title {
  margin: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

.form-label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.required {
  color: #ff6b6b;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #646cff;
  background: rgba(255, 255, 255, 0.08);
}

.form-input.input-error {
  border-color: #ff6b6b;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: #ff6b6b;
}

.mb-3 {
  margin-bottom: 1rem;
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variant-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.variant-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #646cff;
  background: rgba(100, 108, 255, 0.15);
  border-radius: 50%;
}

.btn-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.btn-remove:hover {
  color: #ff6b6b;
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.variant-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .variant-fields {
    grid-template-columns: 1fr 2fr 1fr;
  }
}

.variant-fields .form-group {
  margin-bottom: 0;
}

.weight-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: rgba(100, 108, 255, 0.1);
  border: 1px solid rgba(100, 108, 255, 0.3);
  border-radius: 6px;
}

.weight-summary.weight-invalid {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.3);
}

.weight-label {
  color: rgba(255, 255, 255, 0.7);
}

.weight-value {
  font-weight: 600;
  color: #646cff;
}

.weight-summary.weight-invalid .weight-value {
  color: #ff6b6b;
}

.weight-status {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.625rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  color: white;
  background: #646cff;
}

.btn-primary:hover:not(:disabled) {
  background: #535bf2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.4rem 0.875rem;
  font-size: 0.85rem;
}

@media (prefers-color-scheme: light) {
  .form-section {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .form-label {
    color: #213547;
  }

  .form-input,
  .form-textarea {
    color: #213547;
    background: white;
    border-color: rgba(0, 0, 0, 0.15);
  }

  .form-input:focus,
  .form-textarea:focus {
    background: white;
  }

  .variant-item {
    background: rgba(0, 0, 0, 0.01);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .btn-remove {
    color: rgba(0, 0, 0, 0.5);
    border-color: rgba(0, 0, 0, 0.15);
  }

  .btn-remove:hover {
    background: rgba(255, 107, 107, 0.1);
  }

  .weight-label,
  .weight-status {
    color: rgba(0, 0, 0, 0.6);
  }

  .btn-secondary {
    color: #213547;
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.15);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.08);
  }
}
</style>
