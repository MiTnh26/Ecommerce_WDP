// src/pages/admin/AdminDashboard.js
import React, { useState } from 'react';

function AdminDashboard() {
  // State for sidebar & header collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  // Handlers to toggle classes (mimic original JS)
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  const toggleHeader = () => {
    setIsHeaderCollapsed(prev => !prev);
  };

  return (
    <div
      className={
        'page-wrapper' +
        (isSidebarCollapsed ? ' sidebar-collapsed' : '')
      }
      id="main-wrapper"
      data-layout="vertical"
      data-navbarbg="skin6"
      data-sidebartype="full"
      data-sidebar-position="fixed"
      data-header-position="fixed"
    >
      {/* --- App Topstrip --- */}
      <div className="app-topstrip bg-dark py-6 px-3 w-100 d-lg-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center justify-content-center gap-5 mb-2 mb-lg-0">
          <a className="d-flex justify-content-center" href="#">
            <img
              src="/assets/images/logos/logo-wrappixel.svg"
              alt="Logo"
              width="150"
            />
          </a>
        </div>

        <div className="d-lg-flex align-items-center gap-2">
          <h3 className="text-white mb-2 mb-lg-0 fs-5 text-center">
            Check Flexy Premium Version
          </h3>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <div className="dropdown d-flex">
              <a
                className="btn btn-primary d-flex align-items-center gap-1"
                href="#"
                id="drop4"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="ti ti-shopping-cart fs-5"></i>
                Buy Now
                <i className="ti ti-chevron-down fs-5"></i>
              </a>
              <ul
                className="dropdown-menu"
                aria-labelledby="drop4"
              >
                {/* Add dropdown items here if desired */}
                <li>
                  <a className="dropdown-item" href="#">
                    Premium Option 1
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Premium Option 2
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sidebar Start --- */}
      <aside className={'left-sidebar' + (isSidebarCollapsed ? ' collapsed' : '')}>
        <div>
          {/* Brand Logo */}
          <div className="brand-logo d-flex align-items-center justify-content-between">
            <a href="/index.html" className="text-nowrap logo-img">
              <img src="/assets/images/logos/logo.svg" alt="Sidebar Logo" />
            </a>
            {/* Close button on small screens */}
            <div
              className="close-btn d-xl-none d-block sidebartoggler cursor-pointer"
              id="sidebarCollapse"
              onClick={toggleSidebar}
            >
              <i className="ti ti-x fs-6"></i>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="sidebar-nav scroll-sidebar" data-simplebar>
            <ul id="sidebarnav">
              {/* Home Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Home</span>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link" href="./index.html" aria-expanded="false">
                  <i className="ti ti-atom"></i>
                  <span className="hide-menu">Dashboard</span>
                </a>
              </li>

              {/* Dashboard Subitems */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between"
                  href="#"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-aperture"></i>
                    </span>
                    <span className="hide-menu">Analytical</span>
                  </div>
                </a>
              </li>
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between"
                  href="#"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-shopping-cart"></i>
                    </span>
                    <span className="hide-menu">eCommerce</span>
                  </div>
                </a>
              </li>

              {/* Front Pages with Collapse */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#frontPagesSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-layout-grid"></i>
                    </span>
                    <span className="hide-menu">Front Pages</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="frontPagesSubmenu">
                  {[
                    'Homepage',
                    'About Us',
                    'Blog',
                    'Blog Details',
                    'Contact Us',
                    'Portfolio',
                    'Pricing',
                  ].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Apps Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Apps</span>
              </li>

              {/* Ecommerce Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#ecommerceSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-basket"></i>
                    </span>
                    <span className="hide-menu">Ecommerce</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="ecommerceSubmenu">
                  {['Shop', 'Details', 'List', 'Checkout', 'Add Product', 'Edit Product'].map(
                    (label, idx) => (
                      <li className="sidebar-item" key={idx}>
                        <a className="sidebar-link justify-content-between" href="#">
                          <div className="d-flex align-items-center gap-3">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-circle"></i>
                            </div>
                            <span className="hide-menu">{label}</span>
                          </div>
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </li>

              {/* Blog Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#blogSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-chart-donut-3"></i>
                    </span>
                    <span className="hide-menu">Blog</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="blogSubmenu">
                  {['Blog Posts', 'Blog Details'].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Single Links */}
              {[
                { icon: 'ti ti-user-circle', label: 'User Profile' },
                { icon: 'ti ti-mail', label: 'Email' },
                { icon: 'ti ti-calendar', label: 'Calendar' },
                { icon: 'ti ti-layout-kanban', label: 'Kanban' },
                { icon: 'ti ti-message-dots', label: 'Chat' },
                { icon: 'ti ti-notes', label: 'Notes' },
                { icon: 'ti ti-phone', label: 'Contact Table' },
                { icon: 'ti ti-list-details', label: 'Contact List' },
                { icon: 'ti ti-file-text', label: 'Invoice' },
              ].map((item, idx) => (
                <li className="sidebar-item" key={idx}>
                  <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex">
                        <i className={item.icon}></i>
                      </span>
                      <span className="hide-menu">{item.label}</span>
                    </div>
                  </a>
                </li>
              ))}

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Pages Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Pages</span>
              </li>
              {[
                { icon: 'ti ti-accessible', label: 'Animation' },
                { icon: 'ti ti-user-search', label: 'Search Result' },
                { icon: 'ti ti-brand-google-photos', label: 'Gallery' },
                { icon: 'ti ti-masks-theater', label: 'Treeview' },
                { icon: 'ti ti-arrows-maximize', label: 'Block-Ui' },
                { icon: 'ti ti-sort-ascending', label: 'Session Timeout' },
                { icon: 'ti ti-currency-dollar', label: 'Pricing' },
                { icon: 'ti ti-help', label: 'FAQ' },
                { icon: 'ti ti-user-circle', label: 'Account Setting' },
                { icon: 'ti ti-app-window', label: 'Landingpage' },
              ].map((item, idx) => (
                <li className="sidebar-item" key={idx}>
                  <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex">
                        <i className={item.icon}></i>
                      </span>
                      <span className="hide-menu">{item.label}</span>
                    </div>
                  </a>
                </li>
              ))}

              {/* Widgets Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#widgetsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-layout"></i>
                    </span>
                    <span className="hide-menu">Widgets</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="widgetsSubmenu">
                  {['Cards', 'Banner', 'Charts', 'Feeds', 'Apps', 'Data'].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* UI Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">UI</span>
              </li>
              {[
                { icon: 'ti ti-layers-subtract', label: 'Buttons', href: './ui-buttons.html' },
                { icon: 'ti ti-alert-circle', label: 'Alerts', href: './ui-alerts.html' },
                { icon: 'ti ti-cards', label: 'Card', href: './ui-card.html' },
                { icon: 'ti ti-file-text', label: 'Forms', href: './ui-forms.html' },
                { icon: 'ti ti-typography', label: 'Typography', href: './ui-typography.html' },
              ].map((item, idx) => (
                <li className="sidebar-item" key={idx}>
                  <a className="sidebar-link" href={item.href} aria-expanded="false">
                    <i className={item.icon}></i>
                    <span className="hide-menu">{item.label}</span>
                  </a>
                </li>
              ))}

              {/* UI Elements Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#uiElementsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-layout-grid"></i>
                    </span>
                    <span className="hide-menu">Ui Elements</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="uiElementsSubmenu">
                  {[
                    'Accordian',
                    'Badge',
                    'Dropdowns',
                    'Modals',
                    'Tab',
                    'Tooltip & Popover',
                    'Notification',
                    'Progressbar',
                    'Pagination',
                    'Bootstrap UI',
                    'Breadcrumb',
                    'Offcanvas',
                    'Lists',
                    'Grid',
                    'Carousel',
                    'Scrollspy',
                    'Spinner',
                    'Link',
                  ].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Components Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#componentsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-components"></i>
                    </span>
                    <span className="hide-menu">Components</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="componentsSubmenu">
                  {['Sweet Alert', 'Nestable', 'Noui slider', 'Rating', 'Toastr'].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Cards Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#cardsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-cards"></i>
                    </span>
                    <span className="hide-menu">Cards</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="cardsSubmenu">
                  {['Basic Cards', 'Custom Cards', 'Weather Cards', 'Draggable Cards'].map(
                    (label, idx) => (
                      <li className="sidebar-item" key={idx}>
                        <a className="sidebar-link justify-content-between" href="#">
                          <div className="d-flex align-items-center gap-3">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-circle"></i>
                            </div>
                            <span className="hide-menu">{label}</span>
                          </div>
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </li>

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Forms Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Forms</span>
              </li>

              {/* Elements Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#formElementsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-file-text"></i>
                    </span>
                    <span className="hide-menu">Elements</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="formElementsSubmenu">
                  {[
                    'Forms Input',
                    'Input Groups',
                    'Input Grid',
                    'Checkbox & Radios',
                    'Bootstrap Switch',
                    'Select2',
                  ].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Form Addons Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#formAddonsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-qrcode"></i>
                    </span>
                    <span className="hide-menu">Form Addons</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="formAddonsSubmenu">
                  {['Dropzone', 'Form Mask', 'Form Typehead'].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Forms Inputs Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#formsInputsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-files"></i>
                    </span>
                    <span className="hide-menu">Forms Inputs</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="formsInputsSubmenu">
                  {[
                    'Basic Form',
                    'Form Horizontal',
                    'Form Actions',
                    'Row Separator',
                    'Form Bordered',
                    'Form Detail',
                    'Striped Rows',
                    'Form Floating Input',
                  ].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Validation Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#validationSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-alert-circle"></i>
                    </span>
                    <span className="hide-menu">Validation</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="validationSubmenu">
                  {['Bootstrap Validation', 'Custom Validation'].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Form Pickers Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#formPickersSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-file-pencil"></i>
                    </span>
                    <span className="hide-menu">Form Pickers</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="formPickersSubmenu">
                  {['Colorpicker', 'Rangepicker', 'BT Datepicker', 'MT Datepicker'].map(
                    (label, idx) => (
                      <li className="sidebar-item" key={idx}>
                        <a className="sidebar-link justify-content-between" href="#">
                          <div className="d-flex align-items-center gap-3">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-circle"></i>
                            </div>
                            <span className="hide-menu">{label}</span>
                          </div>
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </li>

              {/* Form Editors Submenu */}
              <li className="sidebar-item">
                <a
                  className="sidebar-link justify-content-between has-arrow"
                  href="#formEditorsSubmenu"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-dna"></i>
                    </span>
                    <span className="hide-menu">Form Editors</span>
                  </div>
                </a>
                <ul className="collapse first-level" id="formEditorsSubmenu">
                  {['Quill Editor', 'Tinymce Editor'].map((label, idx) => (
                    <li className="sidebar-item" key={idx}>
                      <a className="sidebar-link justify-content-between" href="#">
                        <div className="d-flex align-items-center gap-3">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">{label}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Simple Links */}
              <li className="sidebar-item">
                <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-files"></i>
                    </span>
                    <span className="hide-menu">Form Wizard</span>
                  </div>
                </a>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-topology-star-3"></i>
                    </span>
                    <span className="hide-menu">Form Repeater</span>
                  </div>
                </a>
              </li>

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Bootstrap Tables Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Bootstrap Tables</span>
              </li>
              {['Basic Table', 'Dark Table', 'Sizing Table', 'Coloured Table'].map((label, idx) => (
                <li className="sidebar-item" key={idx}>
                  <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex">
                        <i className="ti ti-layout-sidebar"></i>
                      </span>
                      <span className="hide-menu">{label}</span>
                    </div>
                  </a>
                </li>
              ))}

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Datatables Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Datatables</span>
              </li>
              {['Basic', 'API', 'Advanced'].map((label, idx) => (
                <li className="sidebar-item" key={idx}>
                  <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex">
                        <i className="ti ti-air-conditioning-disabled"></i>
                      </span>
                      <span className="hide-menu">{label}</span>
                    </div>
                  </a>
                </li>
              ))}

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Charts Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Charts</span>
              </li>
              {[
                'Line Chart',
                'Area Chart',
                'Bar Chart',
                'Pie Chart',
                'Radial Chart',
                'Radar Chart',
              ].map((label, idx) => (
                <li className="sidebar-item" key={idx}>
                  <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex">
                        {label.includes('Line') && <i className="ti ti-chart-line"></i>}
                        {label.includes('Area') && <i className="ti ti-chart-area"></i>}
                        {label.includes('Bar') && <i className="ti ti-chart-bar"></i>}
                        {label.includes('Pie') && <i className="ti ti-chart-bar"></i>}
                        {label.includes('Radial') && <i className="ti ti-chart-arcs"></i>}
                        {label.includes('Radar') && <i className="ti ti-chart-radar"></i>}
                      </span>
                      <span className="hide-menu">{label}</span>
                    </div>
                  </a>
                </li>
              ))}

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Auth Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Auth</span>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link" href="./authentication-login.html" aria-expanded="false">
                  <i className="ti ti-login"></i>
                  <span className="hide-menu">Login</span>
                </a>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-login"></i>
                    </span>
                    <span className="hide-menu">Side Login</span>
                  </div>
                </a>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link" href="./authentication-register.html" aria-expanded="false">
                  <i className="ti ti-user-plus"></i>
                  <span className="hide-menu">Register</span>
                </a>
              </li>
              {[
                'Side Register',
                'Side Forgot Pwd',
                'Boxed Forgot Pwd',
                'Side Two Steps',
                'Boxed Two Steps',
                'Error',
                'Maintenance',
              ].map((label, idx) => (
                <li className="sidebar-item" key={idx}>
                  <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex">
                        {label.includes('Side') && <i className="ti ti-user-plus"></i>}
                        {label.includes('Forgot') && <i className="ti ti-rotate"></i>}
                        {label.includes('Two') && <i className="ti ti-zoom-code"></i>}
                        {label === 'Error' && <i className="ti ti-alert-circle"></i>}
                        {label === 'Maintenance' && <i className="ti ti-settings"></i>}
                      </span>
                      <span className="hide-menu">{label}</span>
                    </div>
                  </a>
                </li>
              ))}

              {/* Divider */}
              <li>
                <span className="sidebar-divider lg"></span>
              </li>

              {/* Extra Section */}
              <li className="nav-small-cap">
                <iconify-icon
                  icon="solar:menu-dots-linear"
                  className="nav-small-cap-icon fs-4"
                ></iconify-icon>
                <span className="hide-menu">Extra</span>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link justify-content-between" href="#" aria-expanded="false">
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-mood-smile"></i>
                    </span>
                    <span className="hide-menu">Solar Icon</span>
                  </div>
                </a>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link" href="./icon-tabler.html" aria-expanded="false">
                  <i className="ti ti-archive"></i>
                  <span className="hide-menu">Tabler Icon</span>
                </a>
              </li>
              <li className="sidebar-item">
                <a className="sidebar-link" href="./sample-page.html" aria-expanded="false">
                  <i className="ti ti-file"></i>
                  <span className="hide-menu">Sample Page</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      {/* --- Sidebar End --- */}

      {/* --- Main Wrapper --- */}
      <div className="body-wrapper">
        {/* --- Header Start --- */}
        <header className="app-header">
          <nav className="navbar navbar-expand-lg navbar-light">
            <ul className="navbar-nav">
              <li className="nav-item d-block d-xl-none">
                <a
                  className="nav-link sidebartoggler"
                  id="headerCollapse"
                  href="#"
                  onClick={toggleHeader}
                >
                  <i className="ti ti-menu-2"></i>
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link"
                  href="#"
                  id="drop1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-bell"></i>
                  <div className="notification bg-primary rounded-circle"></div>
                </a>
                <div
                  className="dropdown-menu dropdown-menu-animate-up"
                  aria-labelledby="drop1"
                >
                  <div className="message-body">
                    <a href="#" className="dropdown-item">
                      Item 1
                    </a>
                    <a href="#" className="dropdown-item">
                      Item 2
                    </a>
                  </div>
                </div>
              </li>
            </ul>
            <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
              <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link"
                    href="#"
                    id="drop2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src="/assets/images/profile/user-1.jpg"
                      alt="User"
                      width="35"
                      height="35"
                      className="rounded-circle"
                    />
                  </a>
                  <div
                    className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up"
                    aria-labelledby="drop2"
                  >
                    <div className="message-body">
                      <a href="#" className="d-flex align-items-center gap-2 dropdown-item">
                        <i className="ti ti-user fs-6"></i>
                        <p className="mb-0 fs-3">My Profile</p>
                      </a>
                      <a href="#" className="d-flex align-items-center gap-2 dropdown-item">
                        <i className="ti ti-mail fs-6"></i>
                        <p className="mb-0 fs-3">My Account</p>
                      </a>
                      <a href="#" className="d-flex align-items-center gap-2 dropdown-item">
                        <i className="ti ti-list-check fs-6"></i>
                        <p className="mb-0 fs-3">My Task</p>
                      </a>
                      <a
                        href="./authentication-login.html"
                        className="btn btn-outline-primary mx-3 mt-2 d-block"
                      >
                        Logout
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </header>
        {/* --- Header End --- */}

        <div className="body-wrapper-inner">
          <div className="container-fluid">
            {/* Row 1 */}
            <div className="row">
              {/* Sales Overview Card */}
              <div className="col-lg-8">
                <div className="card w-100">
                  <div className="card-body">
                    <div className="d-md-flex align-items-center">
                      <div>
                        <h4 className="card-title">Sales Overview</h4>
                        <p className="card-subtitle">Ample admin Vs Pixel admin</p>
                      </div>
                      <div className="ms-auto">
                        <ul className="list-unstyled mb-0">
                          <li className="list-inline-item text-primary">
                            <span className="round-8 text-bg-primary rounded-circle me-1 d-inline-block"></span>
                            Ample
                          </li>
                          <li className="list-inline-item text-info">
                            <span className="round-8 text-bg-info rounded-circle me-1 d-inline-block"></span>
                            Pixel Admin
                          </li>
                        </ul>
                      </div>
                    </div>
                    {/* Placeholder for Chart */}
                    <div id="sales-overview" className="mt-4 mx-n6"></div>
                  </div>
                </div>
              </div>

              {/* Weekly Stats Card */}
              <div className="col-lg-4">
                <div className="card overflow-hidden">
                  <div className="card-body pb-0">
                    <div className="d-flex align-items-start">
                      <div>
                        <h4 className="card-title">Weekly Stats</h4>
                        <p className="card-subtitle">Average sales</p>
                      </div>
                      <div className="ms-auto">
                        <div className="dropdown">
                          <a
                            href="#"
                            className="text-muted"
                            id="year1-dropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="ti ti-dots fs-7"></i>
                          </a>
                          <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="year1-dropdown"
                          >
                            <li>
                              <a className="dropdown-item" href="#">
                                Action
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#">
                                Another action
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#">
                                Something else here
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Stats Items */}
                    {[
                      {
                        icon: 'ti ti-shopping-cart fs-6',
                        title: 'Top Sales',
                        subtitle: 'Johnathan Doe',
                        badge: '+68%',
                        badgeClass: 'bg-secondary-subtle text-muted',
                        btnClass: 'btn-primary',
                      },
                      {
                        icon: 'ti ti-star fs-6',
                        title: 'Best Seller',
                        subtitle: 'MaterialPro Admin',
                        badge: '+68%',
                        badgeClass: 'bg-secondary-subtle text-muted',
                        btnClass: 'btn-warning',
                      },
                      {
                        icon: 'ti ti-message-dots fs-6',
                        title: 'Most Commented',
                        subtitle: 'Ample Admin',
                        badge: '+68%',
                        badgeClass: 'bg-secondary-subtle text-muted',
                        btnClass: 'btn-success',
                      },
                      {
                        icon: 'ti ti-diamond fs-6',
                        title: 'Top Budgets',
                        subtitle: 'Sunil Joshi',
                        badge: '+15%',
                        badgeClass: 'bg-secondary-subtle text-muted',
                        btnClass: 'btn-secondary',
                      },
                    ].map((item, idx) => (
                      <div
                        className={
                          'py-3 d-flex align-items-center ' +
                          (idx === 0 ? 'mt-4 pb-3' : '') +
                          (idx === 3 ? 'pt-3 mb-7' : '')
                        }
                        key={idx}
                      >
                        <span className={`btn ${item.btnClass} rounded-circle round-48 hstack justify-content-center`}>
                          <i className={item.icon}></i>
                        </span>
                        <div className="ms-3">
                          <h5 className="mb-0 fw-bolder fs-4">{item.title}</h5>
                          <span className="text-muted fs-3">{item.subtitle}</span>
                        </div>
                        <div className="ms-auto">
                          <span className={`badge ${item.badgeClass}`}>{item.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Performance Card */}
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-md-flex align-items-center">
                      <div>
                        <h4 className="card-title">Products Performance</h4>
                        <p className="card-subtitle">Ample Admin Vs Pixel Admin</p>
                      </div>
                      <div className="ms-auto mt-3 mt-md-0">
                        <select
                          className="form-select theme-select border-0"
                          aria-label="Default select example"
                        >
                          <option value="1">March 2025</option>
                          <option value="2">April 2025</option>
                          <option value="3">May 2025</option>
                        </select>
                      </div>
                    </div>
                    {/* Placeholder for Products Performance chart or table */}
                    <div id="products-performance" className="mt-4"></div>
                  </div>
                </div>
              </div>

              {/* (You can add more rows/content here as in original template) */}
            </div>
          </div>
        </div>
      </div>
      {/* --- Main Wrapper End --- */}
    </div>
  );
}

export default AdminDashboard;
