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

  lastId: 0,

  addContact: function(e) {
    e.preventDefault();

    $('#new-contact form').get(0).reset();
    $('#contacts').fadeOut();
    $('#new-contact').fadeIn();
  },

  createContact: function(e) {
    e.preventDefault();
    this.lastId++;
    var contact = { id: this.lastId };
    var $form = $(e.target);
    
    $form.serializeArray().forEach(function(input) {
      contact[input.name] = input.value;
    });
    this.contacts.push(contact);
    if ($('#contacts ul').length) {
      $('#contacts').find('ul').append(templates.contact(contact));
    } else {
      $('#contacts section').html(templates.contactList({ contacts: this.contacts }));
    }
    $('#new-contact').fadeOut();
    $('#contacts').fadeIn();
  },

  showContacts: function() {
    $('#contacts section').append(templates.contactList({ contacts: this.contacts }));
    $('#contacts').slideDown();
  },

  cancel: function(e) {
    e.preventDefault();
    var $el = $(e.target);

    $el.closest('form').get(0).reset();
    $el.closest('.container').fadeOut();
    $('#contacts').fadeIn();
  },

  bindEvents: function() {
    $('.add-contact').on('click', this.addContact.bind(this));
    $('#new-contact form').on('submit', this.createContact.bind(this));
    $('form').on('click', '.cancel', this.cancel.bind(this));
  },

  init: function() {
    this.cacheTemplates();
    this.showContacts();
    this.bindEvents();
  }
}

$(contactManager.init.bind(contactManager));