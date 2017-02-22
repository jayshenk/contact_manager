var templates = [];

var Contact = {
  id: 1,
  name: '',
  phone: '',
  email: '',

  init: function(id, name, phone, email) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
  }
};

var contactManager = {
  contacts: [],

  cacheTemplates: function() {
    $("script[type='text/x-handlebars']").each(function() {
      var $template = $(this);
      templates[$template.attr('id')] = Handlebars.compile($template.html());
    });

    $('[data-type=partial]').each(function() {
      var $partial = $(this);
      Handlebars.registerPartial($partial.attr('id'), $partial.html());
    });
  },

  addContact: function(e) {
    e.preventDefault();

    $('main').append(templates.)
  },

  showContacts: function() {
    $('main').append(templates.contacts({ contacts: this.contacts }));
  },

  bindEvents: function() {
    $('main').on('click', '.add-contact', this.addContact.bind(this));
  },

  init: function() {
    this.cacheTemplates();
    this.bindEvents();
    this.showContacts();
  }
}

$(contactManager.init.bind(contactManager));