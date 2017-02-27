var contactManager;

$(function() {
  var $main = $('main');
  var $contacts = $main.find('#contacts');
  var $list = $contacts.find('section');
  var $newContact = $main.find('#new-contact');
  var $editContact = $main.find('#edit-contact');
  var templates = [];

  contactManager = {
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

      $newContact.find('form').get(0).reset();
      $contacts.fadeOut();
      $newContact.fadeIn();
    },

    addContact: function(contact) {
      if ($contacts.find('li').length) {
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

    findContact: function(idx) {
      return this.contacts.find(function(contact) {
        return contact.id === idx;
      });
    },

    edit: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var id = $el.closest('li').data('id');
      var contact = this.findContact(id);

      $editContact.html(templates.edit(contact));
      $editContact.fadeIn();
      $contacts.fadeOut();
    },

    modify: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var id = $form.data('id');
      var contact = this.findContact(id);
      
      this.updateContact(contact, $form);
      this.renderContacts();
      this.showContacts();
    },

    updateContact: function(contact, $form) {
      $form.serializeArray().forEach(function(input) {
        contact[input.name] = input.value;
      });
      return contact;
    },

    loadStorage: function() {
      this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];
      this.lastId = parseInt(localStorage.getItem('lastId'), 10);
      $list.append(templates.contactList({ contacts: this.contacts }));
      $contacts.slideDown();
    },

    renderContacts: function() {
      $list.html(templates.contactList({ contacts: this.contacts }));
    },

    showContacts: function() {
      $('.container:visible').fadeOut();
      $contacts.fadeIn();
    },

    emptyContacts: function() {
      $list.append(templates.emptyContacts());
    },

    cancel: function(e) {
      e.preventDefault();
      var $el = $(e.target);

      $el.closest('form').get(0).reset();
      $el.closest('.container').fadeOut();
      $contacts.fadeIn();
    },

    delete: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var $li = $el.closest('li');
      var id = $li.data('id');
      
      if (confirm('Are you sure?')) {
        $li.remove();
        this.destroy(id);        
      }
      if (!this.contacts.length) { this.emptyContacts(); }
    },

    destroy: function(idx) {
      this.contacts = this.contacts.filter(function(contact) {
        return contact.id !== idx;
      });
    },

    save: function() {
      localStorage.setItem('contacts', JSON.stringify(this.contacts));
      localStorage.setItem('lastId', this.lastId);
    },

    bindEvents: function() {
      $contacts.on('click', 'a.add-contact', this.newContact.bind(this));
      $newContact.on('submit', this.createContact.bind(this));
      $editContact.on('submit', this.modify.bind(this));
      $main.on('click', '.cancel', this.cancel.bind(this));
      $contacts.on('click', 'a.edit', this.edit.bind(this));
      $contacts.on('click', 'a.delete', this.delete.bind(this));
      $(window).on('unload', this.save.bind(this));
    },

    init: function() {
      this.cacheTemplates();
      this.loadStorage();
      this.bindEvents();
    }
  }

  contactManager.init();
});