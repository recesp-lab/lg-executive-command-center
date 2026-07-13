
<div className="grid gap-4">
  <Button
    className="w-full"
    onClick={exportSnapshot}
  >
    Exportar Snapshot
  </Button>

  <div className="w-full">
    <input
      id="snapshot-upload"
      type="file"
      accept=".json"
      style={{ display: 'none' }}
      onChange={importSnapshot}
    />

    <Button
      className="w-full"
      onClick={() =>
        document
          .getElementById('snapshot-upload')
          ?.click()
      }
    >
      Importar Snapshot
    </Button>
  </div>

  <Button
    variant="outline"
    className="w-full"
  >
    Restaurar Backup
  </Button>

  <Button
    variant="outline"
    className="w-full"
  >
    Verificar Dados
  </Button>
</div>
