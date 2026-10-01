const records = [1].map((number) => createRecord(number));
const rowsElement = document.querySelector('#student-rows');
const countElement = document.querySelector('#record-count');
const submitButton = document.querySelector('#submit-selected');
const toast = document.querySelector('#toast');
const editDialog = document.querySelector('#edit-dialog');
const editTitle = document.querySelector('#dialog-title');
const editInput = document.querySelector('#edit-value');
const editError = document.querySelector('#dialog-error');
let toastTimeout;
let editingRecordId = null;

function createRecord(number) {
  return {
    id: crypto.randomUUID(),
    number,
    selected: false,
    expanded: false,
  };
}

function studentName(record) {
  return `Student ${record.number}`;
}

function renderRecords() {
  rowsElement.innerHTML = records.map((record) => `
    <tr class="student-row${record.selected ? ' is-selected' : ''}" data-record-id="${record.id}">
      <td>
        <button class="expand-button" type="button" data-action="expand" aria-expanded="${record.expanded}" aria-label="${record.expanded ? 'Collapse' : 'Expand'} ${studentName(record)} details"></button>
      </td>
      <td><input class="row-checkbox" type="checkbox" aria-label="Select ${studentName(record)}"${record.selected ? ' checked' : ''}></td>
      <td class="student-name">${studentName(record)}</td>
      <td class="teacher-name">Teacher ${record.number}</td>
      <td class="student-email">student${record.number}@example.edu</td>
      <td class="action-cell">${record.selected ? '<button class="row-action row-action--delete" type="button" data-action="delete">Delete</button>' : ''}</td>
      <td class="action-cell">${record.selected ? '<button class="row-action" type="button" data-action="edit">Edit</button>' : ''}</td>
    </tr>
    <tr class="detail-row"${record.expanded ? '' : ' hidden'}>
      <td colspan="7">
        <div class="detail-content">
          <span><strong>Program</strong> Information Systems</span>
          <span><strong>Advisor</strong> Teacher ${record.number}</span>
          <span><strong>Status</strong> Enrolled</span>
        </div>
      </td>
    </tr>
  `).join('');
  countElement.textContent = records.length;
  updateSubmitButton();
}

function updateSubmitButton() {
  const selectedCount = records.filter((record) => record.selected).length;
  submitButton.disabled = selectedCount === 0;
  submitButton.classList.toggle('is-active', selectedCount > 0);
  submitButton.textContent = selectedCount ? `Submit selected (${selectedCount})` : 'Submit selected';
}

function showMessage(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.hidden = false;
  toastTimeout = window.setTimeout(() => {
    toast.hidden = true;
  }, 3500);
}

function renumberRecords() {
  records.forEach((record, index) => {
    record.number = index + 1;
  });
}

function closeEditDialog() {
  editDialog.hidden = true;
  editingRecordId = null;
  editError.hidden = true;
}

document.querySelector('#add-student').addEventListener('click', () => {
  try {
    const record = createRecord(records.length + 1);
    records.push(record);
    renderRecords();
    showMessage(`${studentName(record)} Record added successfully`);
  } catch {
    showMessage('Unable to add the student record. Please try again.');
  }
});

rowsElement.addEventListener('change', (event) => {
  if (!event.target.matches('.row-checkbox')) return;
  const row = event.target.closest('.student-row');
  const record = records.find((item) => item.id === row.dataset.recordId);
  record.selected = event.target.checked;
  row.classList.toggle('is-selected', record.selected);
  row.querySelectorAll('.action-cell').forEach((cell, index) => {
    cell.innerHTML = record.selected
      ? index === 0
        ? '<button class="row-action row-action--delete" type="button" data-action="delete">Delete</button>'
        : '<button class="row-action" type="button" data-action="edit">Edit</button>'
      : '';
  });
  updateSubmitButton();
});

rowsElement.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const row = button.closest('.student-row');
  const record = records.find((item) => item.id === row.dataset.recordId);

  if (button.dataset.action === 'expand') {
    record.expanded = !record.expanded;
    button.setAttribute('aria-expanded', record.expanded);
    button.setAttribute('aria-label', `${record.expanded ? 'Collapse' : 'Expand'} ${studentName(record)} details`);
    row.nextElementSibling.hidden = !record.expanded;
  }

  if (button.dataset.action === 'delete') {
    records.splice(records.indexOf(record), 1);
    renumberRecords();
    renderRecords();
    showMessage(`${studentName(record)} Record deleted successfully`);
  }

  if (button.dataset.action === 'edit') {
    editingRecordId = record.id;
    editTitle.textContent = `Edit details of ${studentName(record)}`;
    editInput.value = '';
    editError.hidden = true;
    editDialog.hidden = false;
    editInput.focus();
  }
});

submitButton.addEventListener('click', () => {
  const selectedCount = records.filter((record) => record.selected).length;
  if (selectedCount) showMessage(`${selectedCount} student record${selectedCount === 1 ? '' : 's'} submitted successfully`);
});

document.querySelector('#cancel-edit').addEventListener('click', closeEditDialog);
document.querySelector('#confirm-edit').addEventListener('click', () => {
  if (!editInput.value.trim()) {
    editError.hidden = false;
    editInput.focus();
    return;
  }
  const record = records.find((item) => item.id === editingRecordId);
  if (record) showMessage(`${studentName(record)} data updated successfully`);
  closeEditDialog();
});

editDialog.addEventListener('click', (event) => {
  if (event.target === editDialog) closeEditDialog();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !editDialog.hidden) closeEditDialog();
});

renderRecords();