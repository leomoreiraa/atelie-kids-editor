import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.editor-block')).toHaveCount(3);
});

test('edita texto visualmente, desfaz, refaz e restaura o salvamento', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.locator('[data-canvas-block="inicio"] h2').click();
  await page.getByLabel('Escreva seu título', { exact: true }).fill('Meu projeto da escola');
  await expect(page.locator('[data-canvas-block="inicio"] h2')).toHaveText('Meu projeto da escola');
  await page.getByRole('button', { name: 'Desfazer' }).click();
  await expect(page.locator('[data-canvas-block="inicio"] h2')).toHaveText('Olá! Este é o meu mundo!');
  await page.getByRole('button', { name: 'Refazer' }).click();
  await expect(page.locator('[data-canvas-block="inicio"] h2')).toHaveText('Meu projeto da escola');
  await expect(page.locator('.kid-save-status')).toContainText('Salvo neste navegador');
  await page.reload();
  await expect(page.locator('[data-canvas-block="inicio"] h2')).toHaveText('Meu projeto da escola');
  await page.locator('[data-canvas-block="inicio"] h2').dblclick();
  await page.locator('[data-canvas-block="inicio"] h2').fill('Editado direto na página');
  await page.locator('[data-canvas-block="inicio"] h2').press('Enter');
  await expect(page.getByLabel('Escreva seu título', { exact: true })).toHaveValue('Editado direto na página');
  expect(errors).toEqual([]);
});

test('adiciona peças e exclui', async ({ page }) => {
  await page.getByRole('button', { name: 'Adicionar Botão' }).click();
  await expect(page.locator('.editor-block')).toHaveCount(4);
  await page.locator('.canvas-area').click({ position: { x: 50, y: 50 } });
  await page.getByRole('button', { name: 'Apagar esta peça' }).first().click();
  await expect(page.locator('.editor-block')).toHaveCount(3);
});

test('exporta o ZIP', async ({ page }) => {
  await page.getByRole('button', { name: 'Para o professor' }).click();
  await page.getByRole('button', { name: 'Exportar site' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar meu site' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.zip$/);
  const zip = await JSZip.loadAsync(await readFile((await download.path())!));
  expect(Object.keys(zip.files).sort()).toEqual(['LEIA-ME.txt', 'index.html', 'script.js', 'style.css']);
});

test('mostra código', async ({ page }) => {
  await page.getByRole('button', { name: 'Para o professor' }).click();
  await page.getByRole('button', { name: 'Ver código' }).click();
  await expect(page.getByRole('region', { name: 'Código de index.html' })).toContainText('<!DOCTYPE html>');
  await page.getByRole('tab', { name: 'style.css' }).click();
  await expect(page.getByRole('region', { name: 'Código de style.css' })).toContainText('position: absolute');
  await page.getByRole('tab', { name: 'script.js' }).click();
  await expect(page.getByRole('region', { name: 'Código de script.js' })).toContainText('Interações do site exportado');
});

test('baixa e reabre o projeto', async ({ page }) => {
  await page.getByRole('button', { name: 'Adicionar Imagem' }).click();
  await page.getByRole('button', { name: 'Guardar' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Guardar' }).click();
  const download = await downloadPromise;
  const path = (await download.path())!;
  await page.getByRole('button', { name: 'Começar outro' }).click();
  await page.getByRole('button', { name: /Quero começar em branco/ }).click();
  await expect(page.locator('.editor-block')).toHaveCount(0);
  await page.getByLabel('Importar projeto').setInputFiles(path);
  await expect(page.locator('.editor-block')).toHaveCount(4);
  await page.getByRole('button', { name: 'Desfazer' }).click();
  await expect(page.locator('.editor-block')).toHaveCount(0);
});

test('permite criar e visualizar no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Peças' }).click();
  await page.getByRole('button', { name: 'Adicionar Botão' }).click();
  await expect(page.locator('.editor-block')).toHaveCount(4);
  await page.getByRole('button', { name: 'Fechar' }).click();
  await page.locator('[data-canvas-block]').last().click();
  await page.getByLabel('O que vai no botão?', { exact: true }).fill('Meu portfólio');
  await page.getByRole('button', { name: 'Pronto!' }).click();
  await expect(page.locator('.site-block-button a')).toHaveText('Meu portfólio');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('incorpora imagens enviadas', async ({ page }) => {
  await page.getByRole('button', { name: 'Adicionar Imagem' }).click();
  await page.locator('.kid-panel input[type="file"]').setInputFiles({
    name: 'meu-desenho.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#abcdef"/></svg>'),
  });
  const images = page.locator('.site-block-image img');
  const newImage = images.last();
  await expect(newImage).toHaveAttribute('src', /^data:image\/svg\+xml;base64,/);
  await expect.poll(() => newImage.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(100);
  await page.getByRole('button', { name: 'Fechar' }).click();
  await page.locator('.site-block-image img').last().click();
  await page.getByLabel('Descrição da imagem', { exact: true }).fill('Meu desenho azul');
  await page.getByRole('button', { name: 'Pronto!' }).click();
});