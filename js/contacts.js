$(function() {
  var $contacts = $('#contacts');
  var $list = $contacts.find('section');
  var $newContact = $('#new-contact');
  var templates = [];

  var contactManager = {
    contacts: [],

    lastId: 0,

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

    newContact: function(e) {
      e.preventDefault();

      $('#new-contact form').get(0).reset();
      $contacts.fadeOut();
      $newContact.fadeIn();
    },

    addContact: function(contact) {
      if ($contacts.find('ul').length) {
        $contacts.find('ul').append(templates.contact(contact));
      } else {
        $list.html(templates.contactList({ contacts: this.contacts }));
      }
    },

    createContact: function(e) {
      e.preventDefault();
      this.lastId++;
      var contact = { id: this.lastId };
      var $form = $(e.target);
      
      contact = this.updateContact(contact, $form);
      this.contacts.push(contact);
      this.addContact(contact);
      this.showContacts();
    },

    updateContact: function(contact, $form) {
      $form.serializeArray().forEach(function(input) {
        contact[input.name] = input.value;
      });
      return contact;
    },

    loadContacts: function() {
      this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];
      debugger;
      $list.append(templates.contactList({ contacts: this.contacts }));
      $contacts.slideDown();
    },

    showContacts: function() {
      $('.container:visible').fadeOut();
      $contacts.fadeIn();
    },

    cancel: function(e) {
      e.preventDefault();
      var $el = $(e.target);

      $el.closest('form').get(0).reset();
      $el.closest('.container').fadeOut();
      $contacts.fadeIn();
    },

    save: function() {
      localStorage.setItem('contacts', JSON.stringify(this.contacts));
    },

    bindEvents: function() {
      $('.add-contact').on('click', this.newContact.bind(this));
      $newContact.find('form').on('submit', this.createContact.bind(this));
      $('form').on('click', '.cancel', this.cancel.bind(this));
      $(window).on('unload', this.save.bind(this));
    },

    init: function() {
      this.cacheTemplates();
      this.loadContacts();
      this.bindEvents();
    }
  }

  contactManager.init();
});