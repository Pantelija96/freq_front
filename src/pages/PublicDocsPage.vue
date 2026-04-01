<template>
  <div class="login-page">
    <div class="navbar navbar-dark navbar-static py-2">
      <div class="container-fluid">
        <div class="navbar-brand">
          <h3 class="mb-0">Device Efficiency Management</h3>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="content-wrapper">
        <div class="content-inner">
          <div class="content d-flex justify-content-center align-items-center">
            <div class="card login-card mb-0 public-doc-card">
              <div class="card-body text-center">
                <img src="/freq-logo.jfif" alt="Freq logo" class="login-logo mb-3" />
                <div class="app-brand-eyebrow app-brand-eyebrow-dark">Public Download</div>
                <h3 class="mb-2">Frontend User Guide</h3>
                <p class="text-muted mb-4">
                  Download the current PDF guide for the frontend application.
                </p>

                <a
                  class="btn btn-primary"
                  href="/frontend-user-guide.pdf"
                  download="frontend-user-guide.pdf"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
